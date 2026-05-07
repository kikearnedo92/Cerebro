// =====================================================================
// Cerebro · Google Drive Sync (Edge Function)
//
// Strategy: download + parse server-side (no Drive API copy → no need
// for write scope). Works with read-only OAuth scope.
//
// Supported file types:
//   - Google Workspace (gdoc/gsheet/gslides): export as text via Drive API
//   - Microsoft Office (.docx/.xlsx/.pptx): download bytes + parse with npm libs
//   - PDF: download bytes + parse with unpdf
//   - Plain text/markdown/csv/html: direct download
//
// Excluded: image/*, video/*, audio/*
// =====================================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mammoth from 'npm:mammoth@1.6.0'
import * as XLSX from 'npm:xlsx@0.18.5'
import { extractText, getDocumentProxy } from 'npm:unpdf@0.12.1'
import JSZip from 'npm:jszip@3.10.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') ?? ''

// =====================================================================
// Crypto helpers (AES-256-GCM, compatible con api/_lib/crypto.js)
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
  if (!TOKEN_ENCRYPTION_KEY || TOKEN_ENCRYPTION_KEY.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY missing or invalid (need 64 hex chars)')
  }
  const parts = blob.split('.')
  if (parts.length !== 3) throw new Error('Invalid encrypted token format')
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
  if (!TOKEN_ENCRYPTION_KEY || TOKEN_ENCRYPTION_KEY.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY missing or invalid')
  }
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
// MIME type filters
// =====================================================================
const GOOGLE_NATIVE_MIMES = [
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
]

const OFFICE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const OFFICE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const OFFICE_PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
const OFFICE_DOC = 'application/msword'
const OFFICE_XLS = 'application/vnd.ms-excel'
const OFFICE_PPT = 'application/vnd.ms-powerpoint'

const OFFICE_MIMES = [OFFICE_DOCX, OFFICE_XLSX, OFFICE_PPTX, OFFICE_DOC, OFFICE_XLS, OFFICE_PPT]

const PLAIN_MIMES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'text/html',
]

const PDF_MIMES = ['application/pdf']

const SUPPORTED_MIMES = [
  ...GOOGLE_NATIVE_MIMES,
  ...OFFICE_MIMES,
  ...PLAIN_MIMES,
  ...PDF_MIMES,
]

// =====================================================================
// Main handler
// =====================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, service, folder_id } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    const { data: profile } = await adminClient
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) throw new Error('Usuario sin tenant')
    const tenantId = profile.tenant_id

    const integrationId = service === 'gmail' ? 'gmail' :
                          service === 'calendar' ? 'google_calendar' :
                          'google_drive'

    switch (action) {
      case 'sync':
        return await handleSync(adminClient, tenantId, integrationId, folder_id, user.id)
      case 'list_folders':
        return await handleListFolders(adminClient, tenantId, integrationId)
      case 'disconnect':
        return await handleDisconnect(adminClient, tenantId, integrationId)
      default:
        throw new Error('Acción no válida: ' + action)
    }
  } catch (error) {
    console.error('Error in google-drive-integration:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// =====================================================================
// Auth context with refresh-on-401
// =====================================================================
interface AuthContext {
  accessToken: string
  refreshToken: string | null
  rowId: string
  admin: any
}

async function getAuthContext(admin: any, tenantId: string, integrationId: string): Promise<AuthContext> {
  const { data: row, error } = await admin
    .from('integrations')
    .select('id, status, access_token_encrypted, refresh_token_encrypted')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', integrationId)
    .eq('status', 'connected')
    .maybeSingle()

  if (error) throw new Error(`DB error: ${error.message}`)
  if (!row) throw new Error(`Integración ${integrationId} no conectada`)
  if (!row.access_token_encrypted) throw new Error('No access_token guardado')

  const accessToken = await decryptToken(row.access_token_encrypted)
  const refreshToken = row.refresh_token_encrypted ? await decryptToken(row.refresh_token_encrypted) : null

  return { accessToken, refreshToken, rowId: row.id, admin }
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
  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`Token refresh failed: ${errText.slice(0, 200)}`)
  }
  const data = await resp.json()
  if (!data.access_token) throw new Error('Refresh response missing access_token')
  return data.access_token
}

async function fetchGoogleAuth(ctx: AuthContext, url: string, opts: RequestInit = {}): Promise<Response> {
  const headers = new Headers(opts.headers || {})
  headers.set('Authorization', `Bearer ${ctx.accessToken}`)
  let resp = await fetch(url, { ...opts, headers })

  if (resp.status === 401 && ctx.refreshToken) {
    console.log('🔄 Access token expired, refreshing...')
    const newToken = await refreshGoogleAccessToken(ctx.refreshToken)
    ctx.accessToken = newToken
    try {
      const encrypted = await encryptToken(newToken)
      await ctx.admin
        .from('integrations')
        .update({ access_token_encrypted: encrypted })
        .eq('id', ctx.rowId)
    } catch (e) {
      console.error('Failed to persist refreshed token:', e)
    }
    headers.set('Authorization', `Bearer ${newToken}`)
    resp = await fetch(url, { ...opts, headers })
  }
  return resp
}

// =====================================================================
// SYNC
// =====================================================================
async function handleSync(admin: any, tenantId: string, integrationId: string, folderId?: string, userId?: string) {
  const ctx = await getAuthContext(admin, tenantId, integrationId)

  let q = "trashed = false"
  if (folderId) q += ` and '${folderId}' in parents`
  q += ` and (${SUPPORTED_MIMES.map(m => `mimeType = '${m}'`).join(' or ')})`

  console.log(`🔍 Drive query: ${q}`)

  // Pagination
  const allFiles: any[] = []
  let pageToken: string | undefined = undefined
  const MAX_PAGES = 5
  let pages = 0

  do {
    const params = new URLSearchParams({
      q,
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink,size),nextPageToken',
      pageSize: '100',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const listUrl = `https://www.googleapis.com/drive/v3/files?${params.toString()}`
    const listResp = await fetchGoogleAuth(ctx, listUrl)
    if (!listResp.ok) {
      const errText = await listResp.text()
      throw new Error(`Drive listing failed: ${errText.slice(0, 200)}`)
    }
    const listData = await listResp.json()
    const files = listData.files || []
    allFiles.push(...files)
    pageToken = listData.nextPageToken
    pages++
  } while (pageToken && pages < MAX_PAGES)

  console.log(`📄 Found ${allFiles.length} files across ${pages} page(s)`)

  let newDocuments = 0
  let updatedDocuments = 0
  let skippedDocuments = 0
  let errorDocuments = 0
  let totalDocuments = 0

  for (const file of allFiles) {
    try {
      // Defensive skip for image/video/audio
      if (
        file.mimeType?.startsWith('image/') ||
        file.mimeType?.startsWith('video/') ||
        file.mimeType?.startsWith('audio/')
      ) {
        skippedDocuments++
        continue
      }

      const sizeBytes = parseInt(file.size || '0', 10)
      if (sizeBytes > 25 * 1024 * 1024) {
        console.log(`⏭️  Skipping ${file.name} (>25MB)`)
        skippedDocuments++
        continue
      }

      const { content, contentType } = await extractContent(ctx, file)

      const truncatedContent = content.length > 50000
        ? content.substring(0, 50000) + '... [truncado]'
        : content

      // Upsert by (tenant_id, source, metadata->external_id)
      // Index: knowledge_base_tenant_source_external_uniq (created in migration)
      const { data: existing } = await admin
        .from('knowledge_base')
        .select('id')
        .eq('source', 'google_drive')
        .eq('tenant_id', tenantId)
        .filter('metadata->>external_id', 'eq', file.id)
        .maybeSingle()

      const payload: any = {
        title: file.name,
        content: truncatedContent || `(${contentType}: ${file.name} — sin contenido extraído)`,
        project: 'Google Drive',
        file_type: file.mimeType,
        source: 'google_drive',
        active: true,
        tenant_id: tenantId,
        created_by: userId,
        updated_at: new Date().toISOString(),
        metadata: {
          external_id: file.id,
          file_url: file.webViewLink,
          modified_time: file.modifiedTime,
          synced_at: new Date().toISOString(),
          content_type: contentType,
          size_bytes: sizeBytes,
        },
      }

      if (existing) {
        const { error } = await admin
          .from('knowledge_base')
          .update(payload)
          .eq('id', existing.id)
        if (error) {
          console.error(`Update failed for ${file.id} (${file.name}): ${error.message}`)
          errorDocuments++
        } else {
          updatedDocuments++
        }
      } else {
        const { error } = await admin.from('knowledge_base').insert(payload)
        if (!error) {
          newDocuments++
        } else {
          console.error(`Insert failed for ${file.id} (${file.name}): ${error.message}`)
          errorDocuments++
        }
      }
      totalDocuments++
    } catch (err: any) {
      console.error(`Error processing file ${file.id} (${file.name}): ${err.message || err}`)
      errorDocuments++
    }
  }

  console.log(`✅ Sync done — new: ${newDocuments}, updated: ${updatedDocuments}, skipped: ${skippedDocuments}, errors: ${errorDocuments}, total: ${totalDocuments}`)

  await admin
    .from('integrations')
    .update({ last_sync_at: new Date().toISOString(), items_synced: totalDocuments, sync_status: 'idle' })
    .eq('id', ctx.rowId)

  return new Response(
    JSON.stringify({
      success: true,
      newDocuments,
      updatedDocuments,
      skippedDocuments,
      errorDocuments,
      documentsCount: totalDocuments,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// Content extraction — by mime type
// =====================================================================
async function extractContent(ctx: AuthContext, file: any): Promise<{ content: string, contentType: string }> {
  const mime = file.mimeType

  // Google Workspace native — export as text
  if (GOOGLE_NATIVE_MIMES.includes(mime)) {
    const exportMime = mime === 'application/vnd.google-apps.spreadsheet' ? 'text/csv' : 'text/plain'
    const text = await exportGoogleDoc(ctx, file.id, exportMime)
    return { content: text, contentType: 'google-native' }
  }

  // Plain text / markdown / csv / html
  if (PLAIN_MIMES.includes(mime)) {
    const text = await downloadFileAsText(ctx, file.id)
    return { content: text, contentType: 'plain' }
  }

  // Office / PDF — download bytes + parse server-side
  const bytes = await downloadFileAsBytes(ctx, file.id)
  if (!bytes) return { content: '', contentType: 'unknown' }

  if (mime === OFFICE_DOCX || mime === OFFICE_DOC) {
    return { content: await parseDocx(bytes), contentType: 'docx' }
  }
  if (mime === OFFICE_XLSX || mime === OFFICE_XLS) {
    return { content: await parseXlsx(bytes), contentType: 'xlsx' }
  }
  if (mime === OFFICE_PPTX || mime === OFFICE_PPT) {
    return { content: await parsePptx(bytes), contentType: 'pptx' }
  }
  if (PDF_MIMES.includes(mime)) {
    return { content: await parsePdf(bytes), contentType: 'pdf' }
  }

  return { content: '', contentType: 'unsupported' }
}

async function exportGoogleDoc(ctx: AuthContext, fileId: string, mimeType: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeType)}`
  const resp = await fetchGoogleAuth(ctx, url)
  if (!resp.ok) {
    console.error(`Export failed for ${fileId}: ${resp.status}`)
    return ''
  }
  return await resp.text()
}

async function downloadFileAsText(ctx: AuthContext, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
  const resp = await fetchGoogleAuth(ctx, url)
  if (!resp.ok) return ''
  return await resp.text()
}

async function downloadFileAsBytes(ctx: AuthContext, fileId: string): Promise<Uint8Array | null> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
  const resp = await fetchGoogleAuth(ctx, url)
  if (!resp.ok) {
    console.error(`Download failed for ${fileId}: ${resp.status}`)
    return null
  }
  const buf = await resp.arrayBuffer()
  return new Uint8Array(buf)
}

// ---- Parsers ---------------------------------------------------------

async function parseDocx(bytes: Uint8Array): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer: bytes })
    return result.value || ''
  } catch (e: any) {
    console.error(`DOCX parse failed: ${e.message}`)
    return ''
  }
}

async function parseXlsx(bytes: Uint8Array): Promise<string> {
  try {
    const wb = XLSX.read(bytes, { type: 'array' })
    const out: string[] = []
    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(sheet)
      if (csv.trim().length > 0) {
        out.push(`=== Hoja: ${sheetName} ===\n${csv}`)
      }
    }
    return out.join('\n\n')
  } catch (e: any) {
    console.error(`XLSX parse failed: ${e.message}`)
    return ''
  }
}

async function parsePptx(bytes: Uint8Array): Promise<string> {
  // PPTX = zip containing ppt/slides/slide{N}.xml. Extract <a:t> tags = text runs.
  try {
    const zip = await JSZip.loadAsync(bytes)
    const slideFiles: string[] = []
    zip.forEach((path) => {
      if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) slideFiles.push(path)
    })
    slideFiles.sort()

    const out: string[] = []
    let i = 1
    for (const path of slideFiles) {
      const xml = await zip.file(path)?.async('string') ?? ''
      const texts = Array.from(xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)).map(m => m[1])
      const slideText = texts.join(' ').trim()
      if (slideText) out.push(`--- Slide ${i} ---\n${slideText}`)
      i++
    }
    return out.join('\n\n')
  } catch (e: any) {
    console.error(`PPTX parse failed: ${e.message}`)
    return ''
  }
}

async function parsePdf(bytes: Uint8Array): Promise<string> {
  try {
    const pdf = await getDocumentProxy(bytes)
    const { text } = await extractText(pdf, { mergePages: true })
    return Array.isArray(text) ? text.join('\n\n') : (text || '')
  } catch (e: any) {
    console.error(`PDF parse failed: ${e.message}`)
    return ''
  }
}

// =====================================================================
// LIST FOLDERS
// =====================================================================
async function handleListFolders(admin: any, tenantId: string, integrationId: string) {
  const ctx = await getAuthContext(admin, tenantId, integrationId)
  const resp = await fetchGoogleAuth(
    ctx,
    'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%22application%2Fvnd.google-apps.folder%22&fields=files(id,name)&pageSize=100',
  )
  if (!resp.ok) throw new Error('Error listando folders')
  const data = await resp.json()
  return new Response(
    JSON.stringify({ folders: data.files || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// DISCONNECT
// =====================================================================
async function handleDisconnect(admin: any, tenantId: string, integrationId: string) {
  try {
    const ctx = await getAuthContext(admin, tenantId, integrationId)
    if (ctx.accessToken) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${ctx.accessToken}`, { method: 'POST' }).catch(() => {})
    }
  } catch {}

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
    .eq('integration_id', integrationId)

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
