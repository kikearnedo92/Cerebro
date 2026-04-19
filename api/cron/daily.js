// Cron: single daily job that runs the 3 maintenance tasks in sequence.
// Collapsed into one function to stay under Vercel Hobby's 12-function limit.
//
// Tasks:
//  1. Apply any pending SQL migrations in supabase/migrations/
//  2. Trigger re-sync for every connected integration (Notion today)
//  3. Healthcheck Supabase, Claude API, and the chat endpoint itself
//
// Auth: Vercel's own `x-vercel-cron` header, or manual call with MIGRATE_SECRET.
import fs from 'node:fs/promises'
import path from 'node:path'
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

async function readMigrationsDir() {
  const candidates = [
    path.join(process.cwd(), 'supabase', 'migrations'),
    path.join(process.cwd(), '..', 'supabase', 'migrations'),
  ]
  for (const dir of candidates) {
    try {
      const files = await fs.readdir(dir)
      return { dir, files: files.filter((f) => f.endsWith('.sql')).sort() }
    } catch {
      continue
    }
  }
  throw new Error('Migrations directory not found')
}

async function runMigrations(supabase) {
  const report = { applied: [], skipped: [], failed: null }
  const { error: bootErr } = await supabase.rpc('_exec_migration', { p_sql: 'SELECT 1' })
  if (bootErr && /does not exist|function public\._exec/i.test(bootErr.message || '')) {
    return { ...report, bootstrapRequired: true }
  }
  const { dir, files } = await readMigrationsDir()
  const { data: applied } = await supabase.from('_migrations').select('filename')
  const appliedSet = new Set((applied || []).map((r) => r.filename))
  for (const file of files) {
    if (appliedSet.has(file)) {
      report.skipped.push(file)
      continue
    }
    const sql = await fs.readFile(path.join(dir, file), 'utf8')
    const { error: execErr } = await supabase.rpc('_exec_migration', { p_sql: sql })
    if (execErr) {
      report.failed = { file, error: execErr.message }
      break
    }
    await supabase.from('_migrations').insert({ filename: file })
    report.applied.push(file)
  }
  return report
}

async function syncIntegrations(supabase, base) {
  const report = { triggered: [], skipped: [], failed: [] }
  const { data: integrations } = await supabase
    .from('integrations')
    .select('id, integration_id, tenant_uuid, status')
    .eq('status', 'connected')
  for (const i of integrations || []) {
    if (i.integration_id === 'notion') {
      try {
        const r = await fetch(`${base}/api/integrations/notion/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-sync-token': process.env.INTERNAL_SYNC_TOKEN || process.env.MIGRATE_SECRET,
          },
          body: JSON.stringify({ integrationId: i.id }),
        })
        if (r.ok) report.triggered.push({ id: i.id, provider: 'notion' })
        else report.failed.push({ id: i.id, provider: 'notion', status: r.status })
      } catch (e) {
        report.failed.push({ id: i.id, provider: 'notion', error: e.message })
      }
    } else {
      report.skipped.push({ id: i.id, provider: i.integration_id, reason: 'sync not yet implemented' })
    }
  }
  return report
}

async function healthcheck(supabase, base) {
  const checks = {}
  try {
    const { count } = await supabase.from('tenants').select('*', { count: 'exact', head: true })
    checks.supabase = { ok: true, tenant_count: count }
  } catch (err) {
    checks.supabase = { ok: false, error: err.message }
  }
  try {
    const r = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping', useKnowledgeBase: false }),
    })
    let data = null
    try { data = await r.json() } catch {}
    checks.chat = { ok: r.ok, status: r.status, hasResponse: !!data?.response }
  } catch (err) {
    checks.chat = { ok: false, error: err.message }
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    })
    checks.anthropic = { ok: r.ok, status: r.status }
  } catch (err) {
    checks.anthropic = { ok: false, error: err.message }
  }
  return { checks, allOk: Object.values(checks).every((c) => c.ok) }
}

export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const base = appBaseUrl(req)
  const out = { at: new Date().toISOString() }

  try {
    out.migrations = await runMigrations(supabase)
  } catch (err) {
    out.migrations = { error: err.message }
  }
  try {
    out.integrations = await syncIntegrations(supabase, base)
  } catch (err) {
    out.integrations = { error: err.message }
  }
  try {
    const h = await healthcheck(supabase, base)
    out.health = h
  } catch (err) {
    out.health = { error: err.message }
  }

  const migFailed = !!out.migrations?.failed
  const status = migFailed || out.health?.allOk === false ? 503 : 200
  return res.status(status).json(out)
}
