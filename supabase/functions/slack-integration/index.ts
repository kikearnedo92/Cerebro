// =====================================================================
// Cerebro · Slack Integration
//
// Indexes Slack messages from public + bot-authorized private channels.
// Strategy: 1 knowledge_base row = 1 day of messages in 1 channel.
// Last 30 days on first sync, last 24h on incremental syncs.
//
// Actions:
//   - sync       (auth: user JWT) — list channels + index recent days
//   - sync_status (auth: user JWT) — counts for progress UI
//   - disconnect (auth: user JWT) — revoke + clear
// =====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOKEN_ENCRYPTION_KEY = Deno.env.get('TOKEN_ENCRYPTION_KEY') ?? ''

// =====================================================================
// Crypto helpers (same as google-drive-integration)
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

// =====================================================================
// Slack API helpers
// =====================================================================
async function slackFetch(token: string, path: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(`https://slack.com/api/${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) throw new Error(`Slack ${path} failed: ${resp.status}`)
  const data = await resp.json()
  if (!data.ok) throw new Error(`Slack ${path}: ${data.error}`)
  return data
}

// =====================================================================
// Main handler
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
        return await handleSyncStatus(admin, tenantId)
      case 'disconnect':
        return await handleDisconnect(admin, tenantId)
      default:
        throw new Error('Acción no válida: ' + action)
    }
  } catch (err) {
    console.error('slack-integration error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// =====================================================================
// SYNC — list channels, index last N days per channel
// =====================================================================
async function handleSync(admin: any, tenantId: string, userId: string) {
  // Decrypt access token
  const { data: row } = await admin
    .from('integrations')
    .select('id, access_token_encrypted, last_sync_at')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', 'slack')
    .eq('status', 'connected')
    .maybeSingle()
  if (!row?.access_token_encrypted) throw new Error('Slack no conectado')
  const accessToken = await decryptToken(row.access_token_encrypted)

  // Initial sync: 30 days. Incremental: from last_sync_at.
  const sinceTs = row.last_sync_at
    ? Math.floor(new Date(row.last_sync_at).getTime() / 1000)
    : Math.floor((Date.now() - 30 * 24 * 3600 * 1000) / 1000)

  console.log(`📥 Slack sync since ${new Date(sinceTs * 1000).toISOString()}`)

  // List channels (public + private the bot is in)
  const channels: any[] = []
  let cursor: string | undefined = undefined
  for (let page = 0; page < 5; page++) {
    const params: any = { types: 'public_channel,private_channel', limit: 200 }
    if (cursor) params.cursor = cursor
    const data = await slackFetch(accessToken, 'conversations.list', params)
    channels.push(...(data.channels || []))
    cursor = data.response_metadata?.next_cursor
    if (!cursor) break
  }

  // Filter only channels the bot is a member of (private channels we won't have access otherwise)
  const memberChannels = channels.filter((c: any) => c.is_member !== false)

  console.log(`📚 Found ${memberChannels.length} channels`)

  let totalDocs = 0
  let newDocs = 0
  let errorDocs = 0

  // For each channel, group messages by day, insert/update 1 row per (channel, day)
  for (const ch of memberChannels) {
    try {
      // Fetch messages
      const msgs: any[] = []
      let mCursor: string | undefined = undefined
      for (let page = 0; page < 3; page++) { // up to 600 messages per channel
        const params: any = { channel: ch.id, oldest: sinceTs, limit: 200 }
        if (mCursor) params.cursor = mCursor
        const data = await slackFetch(accessToken, 'conversations.history', params)
        msgs.push(...(data.messages || []))
        mCursor = data.response_metadata?.next_cursor
        if (!mCursor || !data.has_more) break
      }

      if (msgs.length === 0) continue

      // Group by day
      const byDay = new Map<string, any[]>()
      for (const m of msgs) {
        if (!m.text || m.subtype) continue // skip system messages
        const date = new Date(parseFloat(m.ts) * 1000).toISOString().slice(0, 10)
        if (!byDay.has(date)) byDay.set(date, [])
        byDay.get(date)!.push(m)
      }

      for (const [day, dayMsgs] of byDay.entries()) {
        const externalId = `${ch.id}_${day}`
        const title = `#${ch.name} — ${day}`

        // Format messages as text — sort chronologically
        dayMsgs.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts))
        const content = dayMsgs.map((m) => {
          const time = new Date(parseFloat(m.ts) * 1000).toISOString().slice(11, 16)
          const userTag = m.user ? `<@${m.user}>` : 'unknown'
          return `[${time}] ${userTag}: ${m.text}`
        }).join('\n')

        const truncated = content.length > 50000 ? content.slice(0, 50000) + '... [truncado]' : content

        const payload: any = {
          title,
          content: truncated,
          project: 'Slack',
          file_type: 'slack/channel-day',
          source: 'slack',
          active: true,
          tenant_id: tenantId,
          created_by: userId,
          updated_at: new Date().toISOString(),
          metadata: {
            external_id: externalId,
            channel_id: ch.id,
            channel_name: ch.name,
            day,
            file_url: `https://slack.com/archives/${ch.id}`,
            message_count: dayMsgs.length,
            synced_at: new Date().toISOString(),
          },
        }

        // Upsert by (tenant_id, source, external_id)
        const { data: existing } = await admin
          .from('knowledge_base')
          .select('id')
          .eq('source', 'slack')
          .eq('tenant_id', tenantId)
          .filter('metadata->>external_id', 'eq', externalId)
          .maybeSingle()

        if (existing) {
          const { error } = await admin.from('knowledge_base').update(payload).eq('id', existing.id)
          if (error) errorDocs++
          else totalDocs++
        } else {
          const { error } = await admin.from('knowledge_base').insert(payload)
          if (error) errorDocs++
          else { totalDocs++; newDocs++ }
        }
      }
    } catch (e: any) {
      console.error(`Channel ${ch.name} error: ${e.message}`)
    }
  }

  // Update integration metadata
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
      channels: memberChannels.length,
      newDocuments: newDocs,
      documentsCount: totalDocs,
      errorDocuments: errorDocs,
      message: `Sincronizados ${totalDocs} dias de conversaciones de ${memberChannels.length} canales (${newDocs} nuevos).`,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// SYNC STATUS
// =====================================================================
async function handleSyncStatus(admin: any, tenantId: string) {
  const { count } = await admin
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'slack')
    .eq('tenant_id', tenantId)
  return new Response(
    JSON.stringify({ success: true, total: count || 0, finished: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// =====================================================================
// DISCONNECT
// =====================================================================
async function handleDisconnect(admin: any, tenantId: string) {
  const { data: row } = await admin
    .from('integrations')
    .select('id, access_token_encrypted')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
    .eq('integration_id', 'slack')
    .maybeSingle()

  if (row?.access_token_encrypted) {
    try {
      const token = await decryptToken(row.access_token_encrypted)
      await fetch('https://slack.com/api/auth.revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    } catch {}
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
    .eq('integration_id', 'slack')

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
