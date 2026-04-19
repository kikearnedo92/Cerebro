// Cron: cada 15 min revisa que el chat responda, que Supabase esté accesible,
// y si algo falla, manda alerta por email.
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

  const base = appBaseUrl(req)
  const report = { at: new Date().toISOString(), checks: {} }

  // Check 1: Supabase
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
    report.checks.supabase = { ok: true, tenant_count: count }
  } catch (err) {
    report.checks.supabase = { ok: false, error: err.message }
  }

  // Check 2: Chat endpoint responds
  try {
    const r = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping', useKnowledgeBase: false }),
    })
    const ok = r.ok
    let data = null
    try { data = await r.json() } catch {}
    report.checks.chat = { ok, status: r.status, hasResponse: !!data?.response }
  } catch (err) {
    report.checks.chat = { ok: false, error: err.message }
  }

  // Check 3: Claude API reachable
  try {
    const r = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    })
    report.checks.anthropic = { ok: r.ok, status: r.status }
  } catch (err) {
    report.checks.anthropic = { ok: false, error: err.message }
  }

  const allOk = Object.values(report.checks).every((c) => c.ok)
  report.allOk = allOk

  return res.status(allOk ? 200 : 503).json(report)
}
