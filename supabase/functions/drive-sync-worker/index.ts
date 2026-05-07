// =====================================================================
// Cerebro · Drive Sync Worker
//
// Background worker that processes the drive_sync_queue. Invoked by:
//   1. GitHub Actions cron every minute
//   2. Manual trigger from drive-sync-enqueue (fire-and-forget)
//
// Per-call budget: 5 files (well under 2s CPU cap with lazy-loaded parsers).
// Worker takes oldest pending across all tenants (FIFO).
//
// Auth: requires service_role key in Authorization header (server-to-server).
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Worker auth token — the cron job authenticates with this shared secret.
// Set in both:
//   - Supabase Edge Function secrets (supabase secrets set WORKER_AUTH_TOKEN=...)
//   - GitHub repository secrets (WORKER_AUTH_TOKEN)
const WORKER_AUTH_TOKEN = Deno.env.get('WORKER_AUTH_TOKEN') ?? ''

const FILES_PER_INVOCATION = 5
const MAX_ATTEMPTS = 3

// =====================================================================
// Crypto (same as google-drive-integration)
// =====================================================================
function hexToBytes(hex: string): Uint8Array {
  const matches = hex.match(/.{2}/g) || []
  return new Uint8Array(matches.map((b) => parseInt(b, 16)))
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
  const parts = blob.split('.')
  const [ivB64, tagB64, ctB64] = parts
  const keyBytes = hexToBytes(TOKEN_ENCRYPTION_KEY)
  const iv = b64ToBytes(ivB64)
  const tag = b64ToBytes(tagB64)
  const ct = b64ToBytes(ctB64)
  const ctWithTag = new Uint8Array(ct.length + tag.length)
  ctWithTag.set(ct)
  ctWithTag.set(tag, ct.length)
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'])
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ctWithTag)
  return new TextDecoder().decode(decrypted)
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

// =====================================================================
// Token cache per tenant (avoid decrypting on every file)
// TTL: 55 min (Google access tokens last 1h, refresh 5 min before expiry)
// =====================================================================
interface CachedToken {
  accessToken: string
  refreshToken: string | null
  rowId: string
  expiresAt: number
}
const tokenCache = new Map<string, CachedToken>()
const TOKEN_TTL_MS = 55 * 60 * 1000

async function getTokensForTenant(admin: any, tenantId: string): Promise<CachedToken> {
  const cached = tokenCache.get(tenantId)
  if (cached && cached.expiresAt > Date.now()) return cached

  const { data: row } = await admin
    .from('integrations')
    .select('id, access_token_encrypted, refresh_token_encrypted')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', 'google_drive')
    .eq('status', 'connected')
    .maybeSingle()
  if (!row?.access_token_encrypted) throw new Error('Drive integration not connected for tenant')
  const accessToken = await decryptToken(row.access_token_encrypted)
  const refreshToken = row.refresh_token_encrypted ? await decryptToken(row.refresh_token_encrypted) : null
  const ctx: CachedToken = { accessToken, refreshToken, rowId: row.id, expiresAt: Date.now() + TOKEN_TTL_MS }
  tokenCache.set(tenantId, ctx)
  return ctx
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!resp.ok) throw new Error(`Token refresh failed: ${(await resp.text()).slice(0, 200)}`)
  const data = await resp.json()
  return data.access_token
}

async function fetchGoogleAuth(admin: any, tenantId: string, url: string, opts: RequestInit = {}): Promise<Response> {
  const ctx = await getTokensForTenant(admin, tenantId)
  const headers = new Headers(opts.headers || {})
  headers.set('Authorization', `Bearer ${ctx.accessToken}`)
  let resp = await fetch(url, { ...opts, headers })
  if (resp.status === 401 && ctx.refreshToken) {
    const newToken = await refreshGoogleAccessToken(ctx.refreshToken)
    ctx.accessToken = newToken
    ctx.expiresAt = Date.now() + TOKEN_TTL_MS
    tokenCache.set(tenantId, ctx)
    try {
      const encrypted = await encryptToken(newToken)
      await admin.from('integrations').update({ access_token_encrypted: encrypted }).eq('id', ctx.rowId)
    } catch {}
    headers.set('Authorization', `Bearer ${newToken}`)
    resp = await fetch(url, { ...opts, headers })
  }
  return resp
}

// =====================================================================
// MIME constants
// =====================================================================
const GOOGLE_NATIVE_MIMES = new Set([
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
])
const OFFICE_DOCX_MIMES = new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'])
const OFFICE_XLSX_MIMES = new Set(['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'])
const OFFICE_PPTX_MIMES = new Set(['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'])
const PLAIN_MIMES = new Set(['text/plain', 'text/markdown', 'text/csv', 'text/html'])

// =====================================================================
// Parsers (lazy-loaded)
// =====================================================================
async function exportGoogleDoc(admin: any, tenantId: string, fileId: string, mimeType: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeType)}`
  const resp = await fetchGoogleAuth(admin, tenantId, url)
  return resp.ok ? await resp.text() : ''
}
async function downloadFileAsText(admin: any, tenantId: string, fileId: string): Promise<string> {
  const resp = await fetchGoogleAuth(admin, tenantId, `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`)
  return resp.ok ? await resp.text() : ''
}
async function downloadFileAsBytes(admin: any, tenantId: string, fileId: string): Promise<Uint8Array | null> {
  const resp = await fetchGoogleAuth(admin, tenantId, `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`)
  if (!resp.ok) return null
  return new Uint8Array(await resp.arrayBuffer())
}
async function parseDocx(bytes: Uint8Array): Promise<string> {
  try {
    const mammoth = (await import('npm:mammoth@1.6.0')).default
    return (await mammoth.extractRawText({ buffer: bytes })).value || ''
  } catch (e: any) { console.error(`DOCX parse: ${e.message}`); return '' }
}
async function parseXlsx(bytes: Uint8Array): Promise<string> {
  try {
    const XLSX = await import('npm:xlsx@0.18.5')
    const wb = XLSX.read(bytes, { type: 'array' })
    return wb.SheetNames
      .map((n: string) => `=== ${n} ===\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`)
      .filter((s: string) => s.trim().length > 0)
      .join('\n\n')
  } catch (e: any) { console.error(`XLSX parse: ${e.message}`); return '' }
}
async function parsePptx(bytes: Uint8Array): Promise<string> {
  try {
    const JSZip = (await import('npm:jszip@3.10.1')).default
    const zip = await JSZip.loadAsync(bytes)
    const slideFiles: string[] = []
    zip.forEach((path: string) => { if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideFiles.push(path) })
    slideFiles.sort()
    const out: string[] = []
    let i = 1
    for (const path of slideFiles) {
      const xml = await zip.file(path)?.async('string') ?? ''
      const texts = Array.from(xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)).map((m: any) => m[1])
      const t = texts.join(' ').trim()
      if (t) out.push(`--- Slide ${i} ---\n${t}`)
      i++
    }
    return out.join('\n\n')
  } catch (e: any) { console.error(`PPTX parse: ${e.message}`); return '' }
}
async function parsePdf(bytes: Uint8Array): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import('npm:unpdf@0.12.1')
    const pdf = await getDocumentProxy(bytes)
    const { text } = await extractText(pdf, { mergePages: true })
    return Array.isArray(text) ? text.join('\n\n') : (text || '')
  } catch (e: any) { console.error(`PDF parse: ${e.message}`); return '' }
}

async function extractContent(admin: any, tenantId: string, file: any): Promise<{ content: string, contentType: string }> {
  const mime = file.file_mime
  if (GOOGLE_NATIVE_MIMES.has(mime)) {
    const exportMime = mime === 'application/vnd.google-apps.spreadsheet' ? 'text/csv' : 'text/plain'
    return { content: await exportGoogleDoc(admin, tenantId, file.file_id, exportMime), contentType: 'google-native' }
  }
  if (PLAIN_MIMES.has(mime)) {
    return { content: await downloadFileAsText(admin, tenantId, file.file_id), contentType: 'plain' }
  }
  const bytes = await downloadFileAsBytes(admin, tenantId, file.file_id)
  if (!bytes) return { content: '', contentType: 'unknown' }
  if (OFFICE_DOCX_MIMES.has(mime)) return { content: await parseDocx(bytes), contentType: 'docx' }
  if (OFFICE_XLSX_MIMES.has(mime)) return { content: await parseXlsx(bytes), contentType: 'xlsx' }
  if (OFFICE_PPTX_MIMES.has(mime)) return { content: await parsePptx(bytes), contentType: 'pptx' }
  if (mime === 'application/pdf') return { content: await parsePdf(bytes), contentType: 'pdf' }
  return { content: '', contentType: 'unsupported' }
}

// =====================================================================
// Process a single queue row
// =====================================================================
async function processQueueRow(admin: any, row: any): Promise<'done' | 'error' | 'skipped'> {
  try {
    const { content, contentType } = await extractContent(admin, row.tenant_id, row)
    const truncated = content.length > 50000 ? content.slice(0, 50000) + '... [truncado]' : content

    const payload: any = {
      title: row.file_name,
      content: truncated || `(${contentType}: ${row.file_name} — sin contenido extraído)`,
      project: 'Google Drive',
      file_type: row.file_mime,
      source: 'google_drive',
      active: true,
      tenant_id: row.tenant_id,
      created_by: row.user_id,
      updated_at: new Date().toISOString(),
      metadata: {
        external_id: row.file_id,
        file_url: row.web_view_link,
        modified_time: row.modified_time,
        synced_at: new Date().toISOString(),
        content_type: contentType,
        size_bytes: row.file_size,
      },
    }

    // Upsert by (tenant_id, source, external_id) — uses the unique index
    const { data: existing } = await admin
      .from('knowledge_base')
      .select('id')
      .eq('source', 'google_drive')
      .eq('tenant_id', row.tenant_id)
      .filter('metadata->>external_id', 'eq', row.file_id)
      .maybeSingle()

    if (existing) {
      await admin.from('knowledge_base').update(payload).eq('id', existing.id)
    } else {
      await admin.from('knowledge_base').insert(payload)
    }
    return 'done'
  } catch (e: any) {
    console.error(`processQueueRow ${row.file_id} (${row.file_name}): ${e.message}`)
    throw e
  }
}

// =====================================================================
// Main: take N pending, process, mark
// =====================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Require WORKER_AUTH_TOKEN — shared secret between cron and worker
  if (!WORKER_AUTH_TOKEN) {
    console.error('WORKER_AUTH_TOKEN env var not set')
    return new Response(JSON.stringify({ error: 'Worker not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const auth = req.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  // Constant-time comparison to prevent timing attacks
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

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    SERVICE_ROLE_KEY,
  )

  // Atomically grab N pending rows and mark them as processing.
  // Using UPDATE...RETURNING with a subquery is the closest to FOR UPDATE SKIP LOCKED
  // we can do via PostgREST. Race-safe enough for our workload.
  const { data: claimed, error: claimErr } = await admin.rpc('claim_drive_sync_jobs', { p_limit: FILES_PER_INVOCATION })
  if (claimErr) {
    console.error(`Claim failed: ${claimErr.message}`)
    return new Response(JSON.stringify({ error: claimErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const rows = claimed || []
  console.log(`🔧 Worker claimed ${rows.length} jobs`)

  let processed = 0
  let errored = 0

  for (const row of rows) {
    try {
      const result = await processQueueRow(admin, row)
      await admin
        .from('drive_sync_queue')
        .update({ status: result, finished_at: new Date().toISOString(), error_message: null })
        .eq('id', row.id)
      processed++
    } catch (e: any) {
      const newAttempts = (row.attempts || 0) + 1
      const finalStatus = newAttempts >= MAX_ATTEMPTS ? 'error' : 'pending'
      await admin
        .from('drive_sync_queue')
        .update({
          status: finalStatus,
          attempts: newAttempts,
          error_message: (e.message || String(e)).slice(0, 500),
          finished_at: finalStatus === 'error' ? new Date().toISOString() : null,
          started_at: null,
        })
        .eq('id', row.id)
      errored++
    }
  }

  return new Response(
    JSON.stringify({ success: true, claimed: rows.length, processed, errored }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
