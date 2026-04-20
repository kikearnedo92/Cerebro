// Super-admin tenants API.
//
//   GET   /api/admin/tenants              → list tenants with derived stats
//   GET   /api/admin/tenants?id=<uuid>    → one tenant detail
//   PATCH /api/admin/tenants?id=<uuid>    → edit name/plan/limits/status
//   POST  /api/admin/tenants              → create tenant manually
//
// Auth: Bearer access token in Authorization header. The caller's profile must
// have is_super_admin=true.
//
// Everything in one file to stay under Vercel Hobby's 12-function deploy cap.
import { getAuthContext, supabaseAdmin } from '../integrations/_lib/supabase.js'

const ALLOWED_PATCH_FIELDS = new Set([
  'name',
  'plan',
  'subscription_status',
  'subscription_active',
  'is_internal',
  'max_users',
  'max_storage_gb',
  'max_monthly_queries',
  'admin_email',
  'domain',
])

async function requireSuperAdmin(req, res) {
  const ctx = await getAuthContext(req)
  if (!ctx) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  if (!ctx.isSuperAdmin) {
    res.status(403).json({ error: 'Super-admin access required' })
    return null
  }
  return ctx
}

async function listTenants(admin, res) {
  const { data: tenants, error } = await admin
    .from('tenants')
    .select(
      'id, name, subdomain, plan, subscription_status, subscription_active, is_internal, max_users, max_storage_gb, max_monthly_queries, admin_email, trial_ends_at, created_at, updated_at'
    )
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })

  // Fan out counts in parallel. A single SQL aggregate would be faster but requires
  // an RPC; for dozens of tenants this round-trip fan-out is fine for MVP.
  const stats = await Promise.all(
    (tenants || []).map(async (t) => {
      const [{ count: users_count }, { count: integrations_count }, { count: docs_count }] = await Promise.all([
        admin.from('profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id),
        admin
          .from('integrations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_uuid', t.id)
          .eq('status', 'connected'),
        admin
          .from('knowledge_base')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', t.id)
          .eq('active', true),
      ])
      return { ...t, users_count, integrations_count, docs_count }
    })
  )

  // Global numbers for the dashboard cards.
  const [{ count: profiles_total }] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  const summary = {
    total_tenants: stats.length,
    active_tenants: stats.filter((t) => t.subscription_status !== 'paused').length,
    internal_tenants: stats.filter((t) => t.is_internal).length,
    total_users: profiles_total,
    total_docs: stats.reduce((s, t) => s + (t.docs_count || 0), 0),
  }

  return res.status(200).json({ tenants: stats, summary })
}

async function getTenant(admin, res, id) {
  const { data: t, error } = await admin.from('tenants').select('*').eq('id', id).single()
  if (error || !t) return res.status(404).json({ error: 'Tenant not found' })
  const [{ count: users_count }, { data: integrations }, { count: docs_count }] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', id),
    admin
      .from('integrations')
      .select('integration_id, status, last_sync_at, items_synced, last_error')
      .eq('tenant_uuid', id),
    admin.from('knowledge_base').select('id', { count: 'exact', head: true }).eq('tenant_id', id).eq('active', true),
  ])
  return res.status(200).json({ tenant: { ...t, users_count, integrations_count: integrations?.length || 0, docs_count }, integrations })
}

async function patchTenant(admin, res, id, body) {
  const patch = {}
  for (const [k, v] of Object.entries(body || {})) {
    if (ALLOWED_PATCH_FIELDS.has(k)) patch[k] = v
  }
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'No valid fields to update' })
  patch.updated_at = new Date().toISOString()
  const { data, error } = await admin.from('tenants').update(patch).eq('id', id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ tenant: data })
}

async function createTenant(admin, res, body) {
  const { name, subdomain, plan = 'starter', admin_email, is_internal = false, max_users, max_storage_gb, max_monthly_queries } = body || {}
  if (!name || !subdomain) return res.status(400).json({ error: 'name and subdomain are required' })
  const row = {
    name,
    subdomain,
    plan,
    admin_email: admin_email || null,
    is_internal,
    max_users: max_users ?? 25,
    max_storage_gb: max_storage_gb ?? 5,
    max_monthly_queries: max_monthly_queries ?? 1000,
    subscription_status: 'trial',
    subscription_active: false,
  }
  const { data, error } = await admin.from('tenants').insert(row).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json({ tenant: data })
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()

  const ctx = await requireSuperAdmin(req, res)
  if (!ctx) return // response already sent

  const admin = supabaseAdmin()
  const id = typeof req.query?.id === 'string' ? req.query.id : null

  try {
    if (req.method === 'GET') {
      return id ? await getTenant(admin, res, id) : await listTenants(admin, res)
    }
    if (req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'id query param required' })
      return await patchTenant(admin, res, id, req.body)
    }
    if (req.method === 'POST') {
      return await createTenant(admin, res, req.body)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('admin/tenants error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
