// GET /api/integrations/notion/callback?code=...&state=...
// Notion redirects here after user authorizes. We exchange the code for tokens,
// encrypt them, save to DB, and redirect back to the app.
import { supabaseAdmin } from '../_lib/supabase.js'
import { encryptToken } from '../_lib/crypto.js'

function appBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { code, state, error: notionError } = req.query
  const base = appBaseUrl(req)

  if (notionError) {
    return res.redirect(`${base}/app/integrations?error=${encodeURIComponent(notionError)}`)
  }
  if (!code || !state) {
    return res.redirect(`${base}/app/integrations?error=missing_params`)
  }

  try {
    const admin = supabaseAdmin()

    // Find the pending row by state
    const { data: pending, error: findErr } = await admin
      .from('integrations')
      .select('id, tenant_uuid, tenant_id')
      .eq('oauth_state', state)
      .eq('integration_id', 'notion')
      .single()

    if (findErr || !pending) {
      return res.redirect(`${base}/app/integrations?error=invalid_state`)
    }

    const clientId = process.env.NOTION_CLIENT_ID
    const clientSecret = process.env.NOTION_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return res.redirect(`${base}/app/integrations?error=missing_creds`)
    }

    const redirectUri = `${base}/api/integrations/notion/callback`
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Notion token exchange failed:', errText)
      await admin
        .from('integrations')
        .update({ status: 'error', oauth_state: null, last_error: `Token exchange failed: ${errText.slice(0, 500)}` })
        .eq('id', pending.id)
      return res.redirect(`${base}/app/integrations?error=token_exchange`)
    }

    const tokenData = await tokenRes.json()
    // Notion response: { access_token, token_type, bot_id, workspace_name, workspace_icon, workspace_id, owner, ... }

    const encrypted = encryptToken(tokenData.access_token)

    await admin
      .from('integrations')
      .update({
        status: 'connected',
        access_token_encrypted: encrypted,
        connected_at: new Date().toISOString(),
        oauth_state: null,
        metadata: {
          workspace_id: tokenData.workspace_id,
          workspace_name: tokenData.workspace_name,
          workspace_icon: tokenData.workspace_icon,
          bot_id: tokenData.bot_id,
          owner: tokenData.owner,
        },
        last_error: null,
      })
      .eq('id', pending.id)

    // Fire-and-forget initial sync (don't block the redirect)
    fetch(`${base}/api/integrations/notion/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-sync-token': process.env.INTERNAL_SYNC_TOKEN || 'unset',
      },
      body: JSON.stringify({ integrationId: pending.id }),
    }).catch((e) => console.warn('Initial sync trigger failed:', e.message))

    return res.redirect(`${base}/app/integrations?connected=notion`)
  } catch (err) {
    console.error('notion/callback error:', err)
    return res.redirect(`${base}/app/integrations?error=server`)
  }
}
