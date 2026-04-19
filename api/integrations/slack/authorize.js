// GET /api/integrations/slack/authorize
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { generateState } from '../_lib/crypto.js'

const SCOPES = [
  'channels:read',
  'channels:history',
  'groups:read',
  'groups:history',
  'users:read',
  'users:read.email',
].join(',')

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

    const clientId = process.env.SLACK_CLIENT_ID
    if (!clientId) {
      return res.status(500).json({
        error: 'SLACK_CLIENT_ID not configured',
        hint: 'See docs/RUNBOOK.md section 3',
      })
    }

    const admin = supabaseAdmin()
    const state = generateState()

    await admin.from('integrations').upsert(
      {
        tenant_id: ctx.tenantId,
        tenant_uuid: ctx.tenantId,
        integration_id: 'slack',
        status: 'connecting',
        oauth_state: state,
        connected_by: ctx.user.id,
      },
      { onConflict: 'tenant_id,integration_id' }
    )

    const redirectUri = `${appBaseUrl(req)}/api/integrations/slack/callback`
    const authUrl = new URL('https://slack.com/oauth/v2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('scope', SCOPES)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)

    if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
      return res.json({ url: authUrl.toString() })
    }
    res.setHeader('Location', authUrl.toString())
    return res.status(302).end()
  } catch (err) {
    console.error('slack/authorize error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
