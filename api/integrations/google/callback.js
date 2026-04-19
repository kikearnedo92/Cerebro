// GET /api/integrations/google/callback?code=...&state=...
import { supabaseAdmin } from '../_lib/supabase.js'
import { encryptToken } from '../_lib/crypto.js'

function appBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { code, state, error: googleError } = req.query
  const base = appBaseUrl(req)

  if (googleError) return res.redirect(`${base}/app/integrations?error=${encodeURIComponent(googleError)}`)
  if (!code || !state) return res.redirect(`${base}/app/integrations?error=missing_params`)

  try {
    const admin = supabaseAdmin()

    const { data: pending, error: findErr } = await admin
      .from('integrations')
      .select('id, tenant_uuid, integration_id, metadata')
      .eq('oauth_state', state)
      .single()

    if (findErr || !pending) {
      return res.redirect(`${base}/app/integrations?error=invalid_state`)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return res.redirect(`${base}/app/integrations?error=missing_creds`)
    }

    const redirectUri = `${base}/api/integrations/google/callback`
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token exchange failed:', errText)
      await admin
        .from('integrations')
        .update({ status: 'error', oauth_state: null, last_error: `Token exchange: ${errText.slice(0, 500)}` })
        .eq('id', pending.id)
      return res.redirect(`${base}/app/integrations?error=token_exchange`)
    }

    const tokenData = await tokenRes.json()
    // { access_token, refresh_token, expires_in, token_type, id_token, scope }

    // Fetch user profile
    let userInfo = {}
    try {
      const uRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (uRes.ok) userInfo = await uRes.json()
    } catch {}

    const encryptedAccess = encryptToken(tokenData.access_token)
    const encryptedRefresh = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    await admin
      .from('integrations')
      .update({
        status: 'connected',
        access_token_encrypted: encryptedAccess,
        refresh_token_encrypted: encryptedRefresh,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
        oauth_state: null,
        metadata: {
          ...(pending.metadata || {}),
          user_email: userInfo.email,
          user_name: userInfo.name,
          user_picture: userInfo.picture,
          scopes: tokenData.scope,
        },
        last_error: null,
      })
      .eq('id', pending.id)

    return res.redirect(`${base}/app/integrations?connected=${pending.integration_id}`)
  } catch (err) {
    console.error('google/callback error:', err)
    return res.redirect(`${base}/app/integrations?error=server`)
  }
}
