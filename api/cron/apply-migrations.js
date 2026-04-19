// Cron: cada 6h revisa si hay migraciones SQL nuevas en supabase/migrations/ y las aplica.
// Se autentica a sí mismo con el MIGRATE_SECRET contra /api/admin/migrate.
//
// Vercel Cron llama a este endpoint con header `Authorization: Bearer <CRON_SECRET>`
// (Vercel lo genera automáticamente). Si quieres exponerlo también externamente,
// validamos MIGRATE_SECRET.

import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function authorized(req) {
  // Vercel cron sends its own auth header
  const vercelCron = req.headers['x-vercel-cron']
  if (vercelCron) return true
  const secret = req.headers['x-admin-migrate-secret']
  if (secret && secret === process.env.MIGRATE_SECRET) return true
  return false
}

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS public._migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public._exec_migration(p_sql TEXT)
RETURNS VOID AS $$ BEGIN EXECUTE p_sql; END; $$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE ALL ON FUNCTION public._exec_migration(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._exec_migration(TEXT) TO service_role;
`

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

export default async function handler(req, res) {
  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const report = { applied: [], skipped: [], failed: null, at: new Date().toISOString() }

  try {
    // Check if _exec_migration exists
    const { error: bootErr } = await supabase.rpc('_exec_migration', { p_sql: 'SELECT 1' })
    if (bootErr && /does not exist|function public\._exec/i.test(bootErr.message || '')) {
      report.bootstrapRequired = true
      report.hint = 'Run bootstrap SQL manually once. Bootstrap is in BOOTSTRAP_SQL constant.'
      return res.status(503).json(report)
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

    return res.status(report.failed ? 500 : 200).json({ ok: !report.failed, ...report })
  } catch (err) {
    console.error('cron/apply-migrations error:', err)
    return res.status(500).json({ ok: false, error: err.message, ...report })
  }
}
