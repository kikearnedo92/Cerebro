// GET /api/integrations/slack/callback
import { supabaseAdmin } from '../_lib/supabase.js'
import { encryptToken } from '../_lib/crypto.js'

function appBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { code, state, error: slackErr } = req.query
  const base = appBaseUrl(req)

  if (slackErr) return res.redirect(`${base}/app/integrations?error=${encodeURIComponent(slackErr)}`)
  if (!code || !state) return res.redirect(`${base}/app/integrations?error=missing_params`)

  try {
    const admin = supabaseAdmin()

    const { data: pending, error: findErr } = await admin
      .from('integrations')
      .select('id, tenant_uuid')
      .eq('oauth_state', state)
      .eq('integration_id', 'slack')
      .single()

    if (findErr || !pending) {
      return res.redirect(`${base}/app/integrations?error=invalid_state`)
    }

    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return res.redirect(`${base}/app/integrations?error=missing_creds`)
    }

    const redirectUri = `${base}/api/integrations/slack/callback`
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    })

    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData)
      await admin
        .from('integrations')
        .update({ status: 'error', oauth_state: null, last_error: `Slack error: ${tokenData.error}` })
        .eq('id', pending.id)
      return res.redirect(`${base}/app/integrations?error=token_exchange`)
    }

    // Slack returns bot access_token in `access_token` with type 'bot'
    const botToken = tokenData.access_token
    const encryptedAccess = encryptToken(botToken)

    await admin
      .from('integrations')
      .update({
        status: 'connected',
        access_token_encrypted: encryptedAccess,
        connected_at: new Date().toISOString(),
        oauth_state: null,
        metadata: {
          team_id: tokenData.team?.id,
          team_name: tokenData.team?.name,
          bot_user_id: tokenData.bot_user_id,
          scope: tokenData.scope,
          authed_user_id: tokenData.authed_user?.id,
        },
        last_error: null,
      })
      .eq('id', pending.id)

    return res.redirect(`${base}/app/integrations?connected=slack`)
  } catch (err) {
    console.error('slack/callback error:', err)
    return res.redirect(`${base}/app/integrations?error=server`)
  }
}
