import "https://deno.land/x/xhr@0.1.0/mod.ts"
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

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']
  )
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ctWithTag)
  return new TextDecoder().decode(decrypted)
}

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

    // Get user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // Get tenant_id from profile
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
// Get connected row from `integrations` table + decrypt access_token
// =====================================================================
async function getConnectedAccessToken(admin: any, tenantId: string, integrationId: string): Promise<{ accessToken: string, refreshToken: string | null, rowId: string }> {
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

  return { accessToken, refreshToken, rowId: row.id }
}

// =====================================================================
// SYNC
// =====================================================================
async function handleSync(admin: any, tenantId: string, integrationId: string, folderId?: string, userId?: string) {
  const { accessToken, rowId } = await getConnectedAccessToken(admin, tenantId, integrationId)

  // Build query
  let q = "mimeType != 'application/vnd.google-apps.folder' and trashed = false"
  if (folderId) q += ` and '${folderId}' in parents`

  const supportedMimeTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ]
  q += ` and (${supportedMimeTypes.map(m => `mimeType = '${m}'`).join(' or ')})`

  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&pageSize=100`
  const listResp = await fetch(listUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } })

  if (!listResp.ok) {
    const errText = await listResp.text()
    throw new Error(`Drive listing failed: ${errText.slice(0, 200)}`)
  }

  const listData = await listResp.json()
  const files = listData.files || []
  console.log(`📄 Found ${files.length} files in Drive to sync`)

  let newDocuments = 0
  let totalDocuments = 0

  for (const file of files) {
    try {
      let content = ''
      if (file.mimeType === 'application/vnd.google-apps.document') {
        content = await exportGoogleDoc(file.id, accessToken, 'text/plain')
      } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        content = await exportGoogleDoc(file.id, accessToken, 'text/csv')
      } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
        content = await exportGoogleDoc(file.id, accessToken, 'text/plain')
      } else if (file.mimeType === 'text/plain' || file.mimeType === 'text/markdown') {
        content = await downloadFile(file.id, accessToken)
      } else if (file.mimeType === 'application/pdf') {
        content = `(PDF: ${file.name} — extracción de texto pendiente)`
      }

      if (content.length > 50000) content = content.substring(0, 50000) + '... [truncado]'

      // Upsert en knowledge_base usando schema REAL (validado 2026-05-06):
      // id, title, content, project, file_type, source, active, tenant_id,
      // created_by, created_at, updated_at, metadata (jsonb)
      //
      // No hay external_id ni file_url como columnas → guardamos en metadata jsonb.
      // Detección de duplicados via metadata->>'external_id'.

      const { data: existing } = await admin
        .from('knowledge_base')
        .select('id')
        .eq('source', 'google_drive')
        .eq('tenant_id', tenantId)
        .filter('metadata->>external_id', 'eq', file.id)
        .maybeSingle()

      const payload: any = {
        title: file.name,
        content: content || '(archivo vacío)',
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
        },
      }

      if (existing) {
        const { error } = await admin
          .from('knowledge_base')
          .update(payload)
          .eq('id', existing.id)
        if (error) console.error(`Update failed for ${file.id}: ${error.message}`)
      } else {
        const { error } = await admin.from('knowledge_base').insert(payload)
        if (!error) {
          newDocuments++
        } else {
          console.error(`Insert failed for ${file.id}: ${error.message}`)
        }
      }
      totalDocuments++
    } catch (err) {
      console.error(`Error processing file ${file.id}:`, err)
    }
  }

  // Update last_sync en integrations row
  await admin
    .from('integrations')
    .update({ last_sync_at: new Date().toISOString(), items_synced: totalDocuments, sync_status: 'idle' })
    .eq('id', rowId)

  return new Response(
    JSON.stringify({ success: true, newDocuments, documentsCount: totalDocuments }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function exportGoogleDoc(fileId: string, accessToken: string, mimeType: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(mimeType)}`
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
  if (!resp.ok) return ''
  return await resp.text()
}

async function downloadFile(fileId: string, accessToken: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
  const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } })
  if (!resp.ok) return ''
  return await resp.text()
}

// =====================================================================
// LIST FOLDERS
// =====================================================================
async function handleListFolders(admin: any, tenantId: string, integrationId: string) {
  const { accessToken } = await getConnectedAccessToken(admin, tenantId, integrationId)
  const resp = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%22application%2Fvnd.google-apps.folder%22&fields=files(id,name)&pageSize=100',
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
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
  // Try to revoke
  try {
    const { accessToken } = await getConnectedAccessToken(admin, tenantId, integrationId)
    if (accessToken) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' }).catch(() => {})
    }
  } catch (e) {
    // No token to revoke, OK
  }

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
