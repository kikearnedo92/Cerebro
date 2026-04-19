// POST /api/admin/migrate
// Applies pending SQL migrations from supabase/migrations/*.sql.
// Uses SUPABASE_SERVICE_ROLE_KEY + Supabase PostgREST RPC to run SQL.
//
// Auth: requires header "x-admin-migrate-secret" = env MIGRATE_SECRET.
// This lets Claude (via the scheduled task with that secret) run migrations
// without a human in the loop.
//
// Migration tracking: stores applied migrations in a `_migrations` table.

import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Bootstrap SQL: creates _migrations table + exec_migration_sql helper RPC.
// Idempotent — safe to run every time.
const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS public._migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper RPC that the service_role can call to run arbitrary SQL.
-- Protected: revoked from anon and authenticated, only service_role can call it.
CREATE OR REPLACE FUNCTION public._exec_migration(p_sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE p_sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public._exec_migration(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public._exec_migration(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public._exec_migration(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public._exec_migration(TEXT) TO service_role;
`

function authorized(req) {
  // Allow either:
  // 1. Super-admin user session (we'll verify later)
  // 2. Explicit MIGRATE_SECRET header (for scheduled tasks)
  const secret = req.headers['x-admin-migrate-secret']
  if (secret && secret === process.env.MIGRATE_SECRET) return true
  return false
}

// On Vercel, process.cwd() is the project root. Migrations live in supabase/migrations/
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
  throw new Error('Migrations directory not found in ' + candidates.join(', '))
}

async function bootstrap(supabase) {
  // We use a raw HTTP call to Postgres via PostgREST RPC since we can't call DDL directly with JS client.
  // Instead, use the REST API exec endpoint. The first time this runs, _exec_migration doesn't exist,
  // so we use a clever trick: use the Supabase SQL API (undocumented but stable): POST /rest/v1/rpc/query
  //
  // Easier path: PostgREST doesn't expose DDL. We fall back to calling the Management API if we have it,
  // OR we document that the user must run BOOTSTRAP_SQL manually once.

  // Try to call _exec_migration to check if it exists
  const { error } = await supabase.rpc('_exec_migration', { p_sql: 'SELECT 1' })
  if (!error) return { bootstrapped: true, alreadyExisted: true }

  // If it doesn't exist, we need a different path. Return a structured error so the caller knows.
  return {
    bootstrapped: false,
    error: error.message,
    bootstrapSqlRequired: BOOTSTRAP_SQL,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
  }

  if (!authorized(req)) {
    return res.status(401).json({
      error: 'Unauthorized',
      hint: 'Send header x-admin-migrate-secret with the value of MIGRATE_SECRET env var',
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const dryRun = req.query.dryRun === 'true'
  const result = {
    dryRun,
    bootstrapRequired: false,
    applied: [],
    skipped: [],
    failed: null,
  }

  try {
    // 1. Bootstrap (or detect that bootstrap is missing)
    const boot = await bootstrap(supabase)
    if (!boot.bootstrapped) {
      result.bootstrapRequired = true
      result.bootstrapSql = BOOTSTRAP_SQL
      result.hint =
        'Run the bootstrap SQL once in Supabase SQL Editor, then call this endpoint again. After that, all future migrations run automatically.'
      return res.status(412).json({ ok: false, ...result })
    }

    // 2. Read migrations from disk
    const { dir, files } = await readMigrationsDir()
    result.migrationsDir = dir

    // 3. Get already-applied migrations
    const { data: applied, error: selErr } = await supabase
      .from('_migrations')
      .select('filename')
    if (selErr) throw new Error('Cannot read _migrations: ' + selErr.message)
    const appliedSet = new Set((applied || []).map((r) => r.filename))

    // 4. Apply each pending migration
    for (const file of files) {
      if (appliedSet.has(file)) {
        result.skipped.push(file)
        continue
      }
      const sql = await fs.readFile(path.join(dir, file), 'utf8')
      if (dryRun) {
        result.applied.push({ file, bytes: sql.length, dryRun: true })
        continue
      }

      const { error: execErr } = await supabase.rpc('_exec_migration', { p_sql: sql })
      if (execErr) {
        result.failed = { file, error: execErr.message }
        break
      }

      await supabase.from('_migrations').insert({ filename: file })
      result.applied.push({ file, bytes: sql.length })
    }

    return res.status(result.failed ? 500 : 200).json({ ok: !result.failed, ...result })
  } catch (err) {
    console.error('migrate error:', err)
    return res.status(500).json({ ok: false, error: err.message, ...result })
  }
}
