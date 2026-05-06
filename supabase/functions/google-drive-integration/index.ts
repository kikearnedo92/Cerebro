import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') ?? ''
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? ''
const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') ??
  'https://cerebro-ivory.vercel.app/api/integrations/google/callback'

// Scopes mínimos: solo Drive read-only de archivos seleccionados por el usuario
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
].join(' ')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, code, refresh_token, folder_id } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('No autorizado')

    switch (action) {
      case 'authorize_url':
        return await handleAuthorizeUrl(user.id)
      case 'connect':
        return await handleConnect(code!, user.id, supabaseClient)
      case 'sync':
        return await handleSync(user.id, supabaseClient, folder_id)
      case 'list_folders':
        return await handleListFolders(user.id, supabaseClient)
      case 'disconnect':
        return await handleDisconnect(user.id, supabaseClient)
      default:
        throw new Error('Acción no válida')
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
// 1. Build authorize URL (opens Google consent screen)
// =====================================================================
async function handleAuthorizeUrl(userId: string) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID no configurado en Supabase env vars')
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: userId, // se devuelve en el callback para identificar al user
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return new Response(
    JSON.stringify({ url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// 2. Connect — exchange code for tokens, save encrypted
// =====================================================================
async function handleConnect(code: string, userId: string, supabaseClient: any) {
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResp.ok) {
    const errorData = await tokenResp.text()
    throw new Error(`Google OAuth error: ${errorData}`)
  }

  const tokens = await tokenResp.json()

  // Guardar config (TODO: cifrar tokens con TOKEN_ENCRYPTION_KEY)
  const { error } = await supabaseClient
    .from('integrations_config')
    .upsert({
      user_id: userId,
      integration_type: 'google_drive',
      config: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
        connected_at: new Date().toISOString(),
      },
      status: 'connected',
      last_sync: null,
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, connected: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// 3. List folders that user can pick to sync
// =====================================================================
async function handleListFolders(userId: string, supabaseClient: any) {
  const { data: config } = await supabaseClient
    .from('integrations_config')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'google_drive')
    .eq('status', 'connected')
    .single()

  if (!config) throw new Error('Google Drive no conectado')

  const accessToken = await refreshAccessTokenIfNeeded(config, supabaseClient, userId)

  // Listar folders del Drive del usuario
  const resp = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%22application%2Fvnd.google-apps.folder%22&fields=files(id%2Cname%2CparentId)&pageSize=100',
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
// 4. Sync files in a folder (or all if no folder_id)
// =====================================================================
async function handleSync(userId: string, supabaseClient: any, folderId?: string) {
  const { data: config } = await supabaseClient
    .from('integrations_config')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'google_drive')
    .eq('status', 'connected')
    .single()

  if (!config) throw new Error('Google Drive no conectado')

  const accessToken = await refreshAccessTokenIfNeeded(config, supabaseClient, userId)

  // Build query: archivos no-folder, en folder específico si se pasa
  let q = "mimeType != 'application/vnd.google-apps.folder' and trashed = false"
  if (folderId) {
    q += ` and '${folderId}' in parents`
  }

  // Tipos soportados: Docs, Sheets, Slides, PDFs, plain text
  const supportedMimeTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/pdf',
    'text/plain',
    'text/markdown',
  ]
  q += ` and (${supportedMimeTypes.map(m => `mimeType = '${m}'`).join(' or ')})`

  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id%2Cname%2CmimeType%2CmodifiedTime%2CwebViewLink)&pageSize=100`

  const listResp = await fetch(listUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })

  if (!listResp.ok) throw new Error('Error listando archivos')

  const listData = await listResp.json()
  const files = listData.files || []
  console.log(`📄 Found ${files.length} files in Drive to sync`)

  let newDocuments = 0
  let totalDocuments = 0

  for (const file of files) {
    try {
      // Exportar/descargar contenido según tipo
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
        // PDFs requieren extracción de texto — TODO: usar pdf-parse o similar
        content = `(PDF: ${file.name} — extracción de texto pendiente)`
      }

      // Truncar si es enorme (max 50K chars)
      if (content.length > 50000) {
        content = content.substring(0, 50000) + '... [truncado]'
      }

      // Upsert en knowledge_base
      const { data: existing } = await supabaseClient
        .from('knowledge_base')
        .select('id')
        .eq('user_id', userId)
        .eq('source_id', file.id)
        .maybeSingle()

      const payload = {
        user_id: userId,
        title: file.name,
        content: content || '(archivo vacío)',
        source: 'google_drive',
        source_id: file.id,
        source_url: file.webViewLink,
        active: true,
        updated_at: new Date().toISOString(),
      }

      if (existing) {
        await supabaseClient
          .from('knowledge_base')
          .update(payload)
          .eq('id', existing.id)
      } else {
        const { error } = await supabaseClient
          .from('knowledge_base')
          .insert({ ...payload, created_at: new Date().toISOString() })
        if (!error) newDocuments++
      }

      totalDocuments++
    } catch (err) {
      console.error(`Error processing file ${file.id}:`, err)
    }
  }

  // Actualizar last_sync
  await supabaseClient
    .from('integrations_config')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', config.id)

  return new Response(
    JSON.stringify({
      success: true,
      newDocuments,
      documentsCount: totalDocuments,
    }),
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
// 5. Disconnect — revoca tokens y limpia config
// =====================================================================
async function handleDisconnect(userId: string, supabaseClient: any) {
  const { data: config } = await supabaseClient
    .from('integrations_config')
    .select('config')
    .eq('user_id', userId)
    .eq('integration_type', 'google_drive')
    .single()

  if (config?.config?.access_token) {
    // Revocar token con Google
    await fetch(`https://oauth2.googleapis.com/revoke?token=${config.config.access_token}`, {
      method: 'POST',
    }).catch(() => {})
  }

  await supabaseClient
    .from('integrations_config')
    .delete()
    .eq('user_id', userId)
    .eq('integration_type', 'google_drive')

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// Helper: refresh access token si está expirado
// =====================================================================
async function refreshAccessTokenIfNeeded(config: any, supabaseClient: any, userId: string): Promise<string> {
  const tokens = config.config
  // Estimación simple: si el token tiene más de 50 min, refrescar
  const connectedAt = new Date(tokens.connected_at).getTime()
  const expiryMs = (tokens.expires_in || 3600) * 1000 - 600 * 1000 // expira 10 min antes por safety

  if (Date.now() - connectedAt < expiryMs && tokens.access_token) {
    return tokens.access_token
  }

  if (!tokens.refresh_token) {
    throw new Error('No refresh_token disponible. Reconectar Google Drive.')
  }

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!resp.ok) throw new Error('Error refrescando token')

  const newTokens = await resp.json()

  // Update config con nuevo access_token
  await supabaseClient
    .from('integrations_config')
    .update({
      config: {
        ...tokens,
        access_token: newTokens.access_token,
        expires_in: newTokens.expires_in,
        connected_at: new Date().toISOString(),
      }
    })
    .eq('user_id', userId)
    .eq('integration_type', 'google_drive')

  return newTokens.access_token
}
