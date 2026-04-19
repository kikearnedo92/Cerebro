// GET /api/integrations/notion/authorize
// Generates an OAuth state, stores it against the tenant, and redirects to Notion's auth page.
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { generateState } from '../_lib/crypto.js'

const NOTION_AUTH_URL = 'https://api.notion.com/v1/oauth/authorize'

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

    const clientId = process.env.NOTION_CLIENT_ID
    if (!clientId) {
      return res.status(500).json({
        error: 'NOTION_CLIENT_ID not configured',
        hint: 'Ask Kike to create a Notion integration app — see docs/RUNBOOK.md section 1',
      })
    }

    const admin = supabaseAdmin()
    const state = generateState()

    // Upsert a connecting row with the state
    await admin.from('integrations').upsert(
      {
        tenant_id: ctx.tenantId,
        tenant_uuid: ctx.tenantId,
        integration_id: 'notion',
        status: 'connecting',
        oauth_state: state,
        connected_by: ctx.user.id,
      },
      { onConflict: 'tenant_id,integration_id' }
    )

    const redirectUri = `${appBaseUrl(req)}/api/integrations/notion/callback`
    const authUrl = new URL(NOTION_AUTH_URL)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('owner', 'user')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)

    // Return JSON for programmatic use (frontend with Bearer auth); legacy redirect if requested.
    if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
      return res.json({ url: authUrl.toString() })
    }
    res.setHeader('Location', authUrl.toString())
    return res.status(302).end()
  } catch (err) {
    console.error('notion/authorize error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
