// GET /api/integrations/google/callback?code=...&state=...
// Google redirects here after the user authorizes on the consent screen.
// We exchange the code for tokens, encrypt them, save them in the
// `integrations` row that authorize.js created (matched by oauth_state),
// then redirect the user back to /app/integrations.

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

  if (googleError) {
    return res.redirect(`${base}/app/integrations?google_error=${encodeURIComponent(String(googleError))}`)
  }
  if (!code || !state) {
    return res.redirect(`${base}/app/integrations?google_error=missing_params`)
  }

  try {
    const admin = supabaseAdmin()

    // 1. Encontrar la fila pendiente que escribió authorize.js (state match)
    //    Puede ser de google_drive, gmail o google_calendar — el integration_id
    //    se guardó en authorize.js.
    const { data: pending, error: findErr } = await admin
      .from('integrations')
      .select('id, tenant_uuid, tenant_id, integration_id, connected_by')
      .eq('oauth_state', state)
      .in('integration_id', ['google_drive', 'gmail', 'google_calendar', 'google_all'])
      .single()

    if (findErr || !pending) {
      console.error('Google callback: state not found', { state, findErr })
      return res.redirect(`${base}/app/integrations?google_error=invalid_state`)
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      await admin
        .from('integrations')
        .update({
          status: 'error',
          oauth_state: null,
          last_error: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured',
        })
        .eq('id', pending.id)
      return res.redirect(`${base}/app/integrations?google_error=missing_creds`)
    }

    const redirectUri = `${base}/api/integrations/google/callback`

    // 2. Intercambiar code por tokens directamente con Google
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token exchange failed:', errText)
      await admin
        .from('integrations')
        .update({
          status: 'error',
          oauth_state: null,
          last_error: `Token exchange failed: ${errText.slice(0, 500)}`,
        })
        .eq('id', pending.id)
      return res.redirect(`${base}/app/integrations?google_error=token_exchange`)
    }

    const tokenData = await tokenRes.json()
    // Google response: { access_token, expires_in, refresh_token?, scope, token_type, id_token? }

    // 3. Cifrar tokens antes de guardar
    const encAccess = encryptToken(tokenData.access_token)
    const encRefresh = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null

    // 4. Update row a connected
    await admin
      .from('integrations')
      .update({
        status: 'connected',
        access_token_encrypted: encAccess,
        refresh_token_encrypted: encRefresh,
        connected_at: new Date().toISOString(),
        oauth_state: null,
        last_error: null,
        metadata: {
          scope: tokenData.scope,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type,
        },
      })
      .eq('id', pending.id)

    return res.redirect(`${base}/app/integrations?google_connected=1&service=${pending.integration_id}`)
  } catch (err) {
    console.error('google/callback error:', err)
    return res.redirect(`${base}/app/integrations?google_error=${encodeURIComponent(err.message || 'unknown')}`)
  }
}
