// =====================================================================
// Cerebro · Gmail Integration
//
// Indexes the user's Gmail inbox: groups by thread, 1 knowledge_base row
// per thread. Last 30 days on first sync, last 24h on incremental.
//
// Reuses Google OAuth from drive (same google integration). Requires
// gmail.readonly scope. If user previously connected only Drive, they
// need to reconnect.
//
// Actions: sync | sync_status | disconnect
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') ?? ''

// =====================================================================
// Crypto helpers (same as drive)
// =====================================================================
function hexToBytes(hex: string): Uint8Array {
  const m = hex.match(/.{2}/g) || []
  return new Uint8Array(m.map((b) => parseInt(b, 16)))
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function bytesToB64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
async function decryptToken(blob: string): Promise<string> {
  if (!blob) throw new Error('No token to decrypt')
  const [ivB64, tagB64, ctB64] = blob.split('.')
  const keyBytes = hexToBytes(TOKEN_ENCRYPTION_KEY)
  const iv = b64ToBytes(ivB64)
  const tag = b64ToBytes(tagB64)
  const ct = b64ToBytes(ctB64)
  const ctWithTag = new Uint8Array(ct.length + tag.length)
  ctWithTag.set(ct)
  ctWithTag.set(tag, ct.length)
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ctWithTag)
  return new TextDecoder().decode(dec)
}
async function encryptToken(plaintext: string): Promise<string> {
  const keyBytes = hexToBytes(TOKEN_ENCRYPTION_KEY)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt'])
  const enc = new TextEncoder().encode(plaintext)
  const ctBuf = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc))
  const ct = ctBuf.slice(0, ctBuf.length - 16)
  const tag = ctBuf.slice(ctBuf.length - 16)
  return `${bytesToB64(iv)}.${bytesToB64(tag)}.${bytesToB64(ct)}`
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!r.ok) throw new Error(`Token refresh failed: ${(await r.text()).slice(0, 200)}`)
  const data = await r.json()
  return data.access_token
}

// =====================================================================
// Gmail API helpers
// =====================================================================
function decodeBase64Url(s: string): string {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  try {
    return decodeURIComponent(escape(atob(s)))
  } catch {
    return atob(s)
  }
}

function extractMessageBody(payload: any): string {
  if (!payload) return ''
  // Prefer text/plain part if exists
  const findPart = (part: any, mime: string): any => {
    if (part.mimeType === mime && part.body?.data) return part
    if (part.parts) {
      for (const p of part.parts) {
        const found = findPart(p, mime)
        if (found) return found
      }
    }
    return null
  }
  const plain = findPart(payload, 'text/plain')
  if (plain) return decodeBase64Url(plain.body.data)
  const html = findPart(payload, 'text/html')
  if (html) {
    const decoded = decodeBase64Url(html.body.data)
    return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return ''
}

function getHeader(headers: any[], name: string): string {
  const h = headers?.find((x) => x.name?.toLowerCase() === name.toLowerCase())
  return h?.value || ''
}

// =====================================================================
// Main
// =====================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { action } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const { data: profile } = await admin.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) throw new Error('Usuario sin tenant')
    const tenantId = profile.tenant_id

    switch (action) {
      case 'sync':
        return await handleSync(admin, tenantId, user.id)
      case 'sync_status':
        return await handleStatus(admin, tenantId)
      case 'disconnect':
        return await handleDisconnect(admin, tenantId)
      default:
        throw new Error('Acción no válida: ' + action)
    }
  } catch (err) {
    console.error('gmail-integration:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleSync(admin: any, tenantId: string, userId: string) {
  const { data: row } = await admin
    .from('integrations')
    .select('id, access_token_encrypted, refresh_token_encrypted, last_sync_at')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', 'gmail')
    .eq('status', 'connected')
    .maybeSingle()
  if (!row?.access_token_encrypted) throw new Error('Gmail no conectado')

  let accessToken = await decryptToken(row.access_token_encrypted)
  const refreshToken = row.refresh_token_encrypted ? await decryptToken(row.refresh_token_encrypted) : null

  // Initial: 30 days. Incremental: from last_sync_at.
  const sinceDate = row.last_sync_at
    ? new Date(row.last_sync_at)
    : new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const sinceQuery = `after:${Math.floor(sinceDate.getTime() / 1000)}`

  // Fetch list of message IDs (with pagination, cap at 200 to control cost)
  const messageIds: string[] = []
  let pageToken: string | undefined = undefined
  for (let page = 0; page < 2; page++) {
    const params = new URLSearchParams({ q: sinceQuery, maxResults: '100' })
    if (pageToken) params.set('pageToken', pageToken)
    let r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (r.status === 401 && refreshToken) {
      accessToken = await refreshAccessToken(refreshToken)
      try {
        await admin.from('integrations').update({
          access_token_encrypted: await encryptToken(accessToken),
        }).eq('id', row.id)
      } catch {}
      r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    }
    if (!r.ok) throw new Error(`Gmail list failed: ${r.status}`)
    const data = await r.json()
    for (const m of data.messages || []) messageIds.push(m.id)
    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  console.log(`📧 Found ${messageIds.length} messages since ${sinceDate.toISOString()}`)

  // Group by threadId and fetch full message
  const threads = new Map<string, any[]>()
  let totalDocs = 0
  let newDocs = 0
  let errorDocs = 0

  for (const msgId of messageIds.slice(0, 100)) { // hard cap per call
    try {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!r.ok) continue
      const m = await r.json()
      if (!threads.has(m.threadId)) threads.set(m.threadId, [])
      threads.get(m.threadId)!.push(m)
    } catch (e) {
      console.error(`fetch ${msgId}: ${e}`)
    }
  }

  // 1 row per thread
  for (const [threadId, msgs] of threads.entries()) {
    try {
      msgs.sort((a, b) => parseInt(a.internalDate || '0') - parseInt(b.internalDate || '0'))
      const first = msgs[0]
      const subject = getHeader(first.payload?.headers || [], 'Subject') || '(sin asunto)'
      const fromHdr = getHeader(first.payload?.headers || [], 'From')

      const content = msgs.map((m: any) => {
        const date = new Date(parseInt(m.internalDate || '0')).toISOString().slice(0, 16).replace('T', ' ')
        const from = getHeader(m.payload?.headers || [], 'From')
        const body = extractMessageBody(m.payload).slice(0, 5000)
        return `[${date}] ${from}\n${body}`
      }).join('\n\n---\n\n')

      const truncated = content.length > 50000 ? content.slice(0, 50000) + '... [truncado]' : content
      const externalId = `gmail_${threadId}`

      const payload: any = {
        title: `📧 ${subject}`,
        content: truncated,
        project: 'Gmail',
        file_type: 'gmail/thread',
        source: 'gmail',
        active: true,
        tenant_id: tenantId,
        created_by: userId,
        updated_at: new Date().toISOString(),
        metadata: {
          external_id: externalId,
          thread_id: threadId,
          message_count: msgs.length,
          from_initial: fromHdr,
          subject,
          file_url: `https://mail.google.com/mail/u/0/#inbox/${threadId}`,
          synced_at: new Date().toISOString(),
        },
      }

      const { data: existing } = await admin
        .from('knowledge_base')
        .select('id')
        .eq('source', 'gmail')
        .eq('tenant_id', tenantId)
        .filter('metadata->>external_id', 'eq', externalId)
        .maybeSingle()

      if (existing) {
        const { error } = await admin.from('knowledge_base').update(payload).eq('id', existing.id)
        if (error) errorDocs++; else totalDocs++
      } else {
        const { error } = await admin.from('knowledge_base').insert(payload)
        if (error) errorDocs++
        else { totalDocs++; newDocs++ }
      }
    } catch (e: any) {
      console.error(`thread ${threadId}: ${e.message}`)
      errorDocs++
    }
  }

  await admin
    .from('integrations')
    .update({
      last_sync_at: new Date().toISOString(),
      items_synced: totalDocs,
      sync_status: 'idle',
    })
    .eq('id', row.id)

  return new Response(
    JSON.stringify({
      success: true,
      threads: threads.size,
      messagesFound: messageIds.length,
      newDocuments: newDocs,
      documentsCount: totalDocs,
      errorDocuments: errorDocs,
      message: `Indexados ${threads.size} threads con ${messageIds.length} mensajes (${newDocs} nuevos).`,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleStatus(admin: any, tenantId: string) {
  const { count } = await admin
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'gmail')
    .eq('tenant_id', tenantId)
  return new Response(
    JSON.stringify({ success: true, total: count || 0, finished: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDisconnect(admin: any, tenantId: string) {
  await admin
    .from('integrations')
    .update({
      status: 'disconnected',
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      oauth_state: null,
      last_error: null,
    })
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', 'gmail')

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
