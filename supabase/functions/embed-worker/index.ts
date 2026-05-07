// =====================================================================
// Cerebro · Embedding Worker (Voyage AI)
//
// Background job that generates Voyage AI embeddings for knowledge_base
// rows where embedding IS NULL. Voyage is Anthropic's official embedding
// partner — keeps the stack consistent with Claude.
//
// Model: voyage-3-large (1024 dim, best quality for RAG)
// Auth: requires WORKER_AUTH_TOKEN in Authorization header.
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const VOYAGE_API_KEY = Deno.env.get('VOYAGE_API_KEY') ?? ''
const WORKER_AUTH_TOKEN = Deno.env.get('WORKER_AUTH_TOKEN') ?? ''

const EMBED_MODEL = 'voyage-3-large'
const EMBED_DIM = 1024
const BATCH_SIZE = 20            // Voyage accepts up to 128 inputs per call
const MAX_INPUT_TOKENS = 16000   // voyage-3-large context window is 32K — leave headroom
const CHARS_PER_TOKEN_APPROX = 4

function truncateForEmbedding(s: string): string {
  const maxChars = MAX_INPUT_TOKENS * CHARS_PER_TOKEN_APPROX
  return s.length > maxChars ? s.slice(0, maxChars) : s
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const resp = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      input_type: 'document', // documents being indexed (vs 'query' at search time)
      truncation: true,
    }),
  })
  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`Voyage embed failed (${resp.status}): ${errText.slice(0, 300)}`)
  }
  const data = await resp.json()
  if (!Array.isArray(data?.data) || data.data.length !== texts.length) {
    throw new Error('Voyage returned malformed embedding response')
  }
  return data.data.map((d: any) => d.embedding)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Auth (constant-time)
  if (!WORKER_AUTH_TOKEN) {
    return new Response(JSON.stringify({ error: 'Worker not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const auth = req.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  let mismatch = token.length !== WORKER_AUTH_TOKEN.length ? 1 : 0
  for (let i = 0; i < Math.max(token.length, WORKER_AUTH_TOKEN.length); i++) {
    mismatch |= (token.charCodeAt(i) || 0) ^ (WORKER_AUTH_TOKEN.charCodeAt(i) || 0)
  }
  if (mismatch !== 0) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!VOYAGE_API_KEY) {
    return new Response(JSON.stringify({ error: 'VOYAGE_API_KEY not set' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: jobs, error } = await admin.rpc('claim_embedding_jobs', { p_limit: BATCH_SIZE })
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!jobs || jobs.length === 0) {
    return new Response(JSON.stringify({ success: true, processed: 0, message: 'No pending embeddings' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  console.log(`🧠 Embedding ${jobs.length} rows with Voyage`)

  const inputs = jobs.map((j: any) => truncateForEmbedding(`${j.title || ''}\n\n${j.content || ''}`))

  let embeddings: number[][]
  try {
    embeddings = await embedBatch(inputs)
  } catch (e: any) {
    console.error(`Embed batch failed: ${e.message}`)
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let updated = 0
  let errored = 0
  const errorSamples: string[] = []

  for (let i = 0; i < jobs.length; i++) {
    const row = jobs[i]
    const emb = embeddings[i]
    if (!emb || emb.length !== EMBED_DIM) {
      errored++
      if (errorSamples.length < 3) errorSamples.push(`Row ${row.id}: bad embedding (len=${emb?.length})`)
      continue
    }

    const vecLiteral = `[${emb.join(',')}]`

    const { error: updateErr } = await admin
      .from('knowledge_base')
      .update({
        embedding: vecLiteral,
        embedding_model: EMBED_MODEL,
        embedded_at: new Date().toISOString(),
      })
      .eq('id', row.id)

    if (updateErr) {
      console.error(`Update failed for ${row.id}: ${updateErr.message}`)
      errored++
      if (errorSamples.length < 3) errorSamples.push(`Row ${row.id}: ${updateErr.message}`)
    } else {
      updated++
    }
  }

  console.log(`✅ Embed batch — updated: ${updated}, errored: ${errored}`)

  return new Response(
    JSON.stringify({ success: true, claimed: jobs.length, processed: updated, errored, errorSamples }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
