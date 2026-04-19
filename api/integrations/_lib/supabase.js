// Shared Supabase clients for /api routes
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn('SUPABASE_URL env var missing')
}

// Service role client — full DB access, bypass RLS. Use only in trusted backend paths.
export function supabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing in env')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Auth client — verifies user's access_token
export function supabaseFromToken(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Extract bearer token from Vercel req
export function bearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization
  if (!auth || !auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

// Load the authenticated user + their tenant_id. Returns null on failure.
export async function getAuthContext(req) {
  const token = bearerToken(req)
  if (!token) return null

  const client = supabaseFromToken(token)
  const { data: userData, error: userErr } = await client.auth.getUser()
  if (userErr || !userData?.user) return null

  const admin = supabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, tenant_id, role_system, is_super_admin')
    .eq('id', userData.user.id)
    .single()

  if (!profile || !profile.tenant_id) return null

  return {
    user: userData.user,
    profile,
    tenantId: profile.tenant_id,
    isAdmin: profile.is_super_admin || ['admin', 'super_admin'].includes(profile.role_system),
    isSuperAdmin: profile.is_super_admin === true,
  }
}
