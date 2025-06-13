
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log('👤 ProfileService: Fetching profile for user:', userId)
  
  try {
    // Direct query without RLS complications - just get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ ProfileService: Direct profile query error:', error)
      // Return a basic profile to prevent app crash
      return createMinimalProfile(userId)
    }

    console.log('✅ ProfileService: Profile loaded:', data?.full_name, 'Role:', data?.role_system)
    return data as Profile
  } catch (error) {
    console.error('❌ ProfileService: Profile fetch failed:', error)
    return createMinimalProfile(userId)
  }
}

const createMinimalProfile = async (userId: string): Promise<Profile> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    let role_system = 'user'
    let is_super_admin = false
    
    // Set admin status for specific emails
    if (user?.email === 'eduardo@retorna.app' || user?.email === 'eduardoarnedog@gmail.com') {
      role_system = 'admin'
      is_super_admin = true
    }

    return {
      id: userId,
      full_name: user?.email?.split('@')[0] || 'Usuario',
      email: user?.email || '',
      area: 'General',
      rol_empresa: role_system === 'admin' ? 'Director' : 'Usuario',
      role_system: role_system,
      is_super_admin: is_super_admin,
      created_at: new Date().toISOString(),
      daily_query_limit: 50,
      queries_used_today: 0,
      last_query_reset: new Date().toISOString().split('T')[0]
    } as Profile
  } catch (error) {
    console.error('❌ ProfileService: Failed to create minimal profile:', error)
    
    // Absolute fallback
    return {
      id: userId,
      full_name: 'Usuario',
      email: '',
      area: 'General',
      rol_empresa: 'Usuario',
      role_system: 'user',
      is_super_admin: false,
      created_at: new Date().toISOString(),
      daily_query_limit: 50,
      queries_used_today: 0,
      last_query_reset: new Date().toISOString().split('T')[0]
    } as Profile
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  const isSuperAdmin = userEmail === 'eduardo@retorna.app' || 
                       userEmail === 'eduardoarnedog@gmail.com' ||
                       profile?.is_super_admin === true ||
                       profile?.role_system === 'super_admin' ||
                       profile?.role_system === 'admin'
  
  const isAdmin = profile?.role_system === 'admin' || 
                  profile?.role_system === 'super_admin' ||
                  userEmail === 'eduardo@retorna.app' ||
                  userEmail === 'eduardoarnedog@gmail.com' ||
                  isSuperAdmin

  console.log('🔍 ProfileService: Admin check -', {
    email: userEmail,
    profileRole: profile?.role_system,
    profileSuperAdmin: profile?.is_super_admin,
    isAdmin,
    isSuperAdmin
  })

  return { isAdmin, isSuperAdmin }
}
