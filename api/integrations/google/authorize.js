// GET /api/integrations/google/authorize?service=drive|gmail|calendar|all
// Single OAuth flow that can include multiple Google services.
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { generateState } from '../_lib/crypto.js'

const SCOPES = {
  drive: 'https://www.googleapis.com/auth/drive.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
}
const ALWAYS = 'openid email profile'

function appBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const ctx = await getAuthContext(req)
    if (!ctx) return res.status(401).json({ error: 'Not authenticated' })
    if (!ctx.isAdmin) return res.status(403).json({ error: 'Only tenant admins can connect integrations' })

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      return res.status(500).json({
        error: 'GOOGLE_CLIENT_ID not configured',
        hint: 'See docs/RUNBOOK.md section 2',
      })
    }

    // Which google integration the user is connecting (drive / gmail / calendar)
    const { service = 'drive' } = req.query
    const validServices = Object.keys(SCOPES)
    if (!validServices.includes(service) && service !== 'all') {
      return res.status(400).json({ error: `Invalid service. Use one of: ${validServices.join(', ')} or 'all'` })
    }

    const scopeList =
      service === 'all'
        ? [ALWAYS, ...Object.values(SCOPES)].join(' ')
        : `${ALWAYS} ${SCOPES[service]}`

    const integrationId =
      service === 'drive' ? 'google_drive' :
      service === 'gmail' ? 'gmail' :
      service === 'calendar' ? 'google_calendar' :
      'google_all'

    const admin = supabaseAdmin()
    const state = generateState()

    await admin.from('integrations').upsert(
      {
        tenant_id: ctx.tenantId,
        tenant_uuid: ctx.tenantId,
        integration_id: integrationId,
        status: 'connecting',
        oauth_state: state,
        connected_by: ctx.user.id,
        metadata: { service },
      },
      { onConflict: 'tenant_id,integration_id' }
    )

    const redirectUri = `${appBaseUrl(req)}/api/integrations/google/callback`
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopeList)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline') // needed for refresh_token
    authUrl.searchParams.set('prompt', 'consent')

    if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
      return res.json({ url: authUrl.toString() })
    }
    res.setHeader('Location', authUrl.toString())
    return res.status(302).end()
  } catch (err) {
    console.error('google/authorize error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
