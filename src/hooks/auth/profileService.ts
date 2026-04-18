// ProfileService.ts - Multi-tenant Cerebro SaaS
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

// Super admin emails for Cerebro platform
const SUPER_ADMIN_EMAILS = ['eduardo@retorna.app', 'kike@usacerebro.com']

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('ProfileService: No authenticated user')
      return createMinimalProfile(userId)
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('ProfileService: DB query failed, creating minimal profile:', error.message)
      return createMinimalProfile(userId, user)
    }

    if (!data) {
      return createMinimalProfile(userId, user)
    }

    return data as Profile
  } catch (error) {
    console.error('ProfileService: Unexpected error:', error)
    return createMinimalProfile(userId)
  }
}

const createMinimalProfile = async (userId: string, user?: any): Promise<Profile> => {
  try {
    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }

    const email = user?.email || ''

    // Determine role based on super admin list
    let role_system = 'user'
    let is_super_admin = false
    let is_admin = false

    if (SUPER_ADMIN_EMAILS.includes(email)) {
      role_system = 'super_admin'
      is_super_admin = true
      is_admin = true
    }

    const profile: Profile = {
      id: userId,
      full_name: user?.user_metadata?.full_name || email.split('@')[0] || 'Usuario',
      email: email,
      company_name: user?.user_metadata?.company_name || '',
      area: is_admin ? 'Administración' : 'General',
      rol_empresa: is_admin ? 'Administrador' : 'Usuario',
      role_system: role_system,
      is_super_admin: is_super_admin,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      daily_query_limit: is_admin ? 1000 : 50,
      queries_used_today: 0,
      last_query_reset: new Date().toISOString().split('T')[0],
    }

    return profile
  } catch (error) {
    console.error('ProfileService: Failed to create minimal profile:', error)
    return {
      id: userId,
      full_name: 'Usuario',
      email: '',
      area: 'General',
      rol_empresa: 'Usuario',
      role_system: 'user',
      is_super_admin: false,
      created_at: new Date().toISOString(),
      last_login: null,
      daily_query_limit: 50,
      queries_used_today: 0,
      last_query_reset: new Date().toISOString().split('T')[0],
    } as Profile
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail || '') ||
    profile?.is_super_admin === true ||
    profile?.role_system === 'super_admin'

  const isAdmin = isSuperAdmin ||
    profile?.role_system === 'admin' ||
    profile?.role_system === 'super_admin'

  return { isAdmin, isSuperAdmin }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('ProfileService: Update failed:', error)
      return null
    }

    return data as Profile
  } catch (error) {
    console.error('ProfileService: Update error:', error)
    return null
  }
}
