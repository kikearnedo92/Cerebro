// Cron: cada 4h dispara re-sync de cada integración conectada.
// Por ahora solo Notion; Google y Slack se agregan cuando tengan sus OAuth creds.
import { createClient } from '@supabase/supabase-js'

function authorized(req) {
  if (req.headers['x-vercel-cron']) return true
  const secret = req.headers['x-admin-migrate-secret']
  if (secret && secret === process.env.MIGRATE_SECRET) return true
  return false
}

function appBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || 'https'
  return `${proto}://${host}`
}

export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return res.status(500).json({ error: 'Supabase env missing' })

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const base = appBaseUrl(req)
  const report = { triggered: [], skipped: [], failed: [], at: new Date().toISOString() }

  try {
    const { data: integrations } = await supabase
      .from('integrations')
      .select('id, integration_id, tenant_uuid, status, last_sync_at')
      .eq('status', 'connected')

    for (const i of integrations || []) {
      if (i.integration_id === 'notion') {
        // Fire-and-forget the sync endpoint using internal token
        try {
          const r = await fetch(`${base}/api/integrations/notion/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-sync-token': process.env.INTERNAL_SYNC_TOKEN || process.env.MIGRATE_SECRET,
            },
            body: JSON.stringify({ integrationId: i.id }),
          })
          if (r.ok) {
            report.triggered.push({ id: i.id, provider: 'notion' })
          } else {
            report.failed.push({ id: i.id, provider: 'notion', status: r.status })
          }
        } catch (e) {
          report.failed.push({ id: i.id, provider: 'notion', error: e.message })
        }
      } else {
        // Google / Slack sync: pendientes de implementar
        report.skipped.push({ id: i.id, provider: i.integration_id, reason: 'sync not yet implemented' })
      }
    }

    return res.json({ ok: true, ...report })
  } catch (err) {
    console.error('cron/sync-integrations error:', err)
    return res.status(500).json({ ok: false, error: err.message, ...report })
  }
}
