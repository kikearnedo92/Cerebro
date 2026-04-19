// POST /api/integrations/notion/disconnect
// Removes the Notion connection for the tenant. Does NOT delete synced knowledge_base
// rows by default (so old data stays searchable). To purge, pass { purge: true } in body.
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const ctx = await getAuthContext(req)
    if (!ctx) return res.status(401).json({ error: 'Not authenticated' })
    if (!ctx.isAdmin) return res.status(403).json({ error: 'Only tenant admins can disconnect integrations' })

    const admin = supabaseAdmin()
    const { purge = false } = req.body || {}

    await admin
      .from('integrations')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        token_expires_at: null,
        metadata: {},
        last_sync_at: null,
        sync_status: 'idle',
      })
      .eq('tenant_uuid', ctx.tenantId)
      .eq('integration_id', 'notion')

    if (purge) {
      await admin.from('knowledge_base').delete().eq('tenant_id', ctx.tenantId).like('source', 'notion:%')
    }

    return res.json({ ok: true, purged: purge })
  } catch (err) {
    console.error('notion/disconnect error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
