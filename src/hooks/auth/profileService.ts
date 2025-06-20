
// ProfileService.ts - VERSIÓN ARREGLADA SIN RLS
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log('👤 ProfileService: Fetching profile for user:', userId)
  
  try {
    // Primero verificar si tenemos usuario activo
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ ProfileService: No authenticated user')
      return createMinimalProfile(userId)
    }

    // Intentar obtener perfil de la base de datos SIN RLS
    console.log('🔍 ProfileService: Attempting to fetch from profiles table...')
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // Usar maybeSingle para evitar errores si no existe

    if (error) {
      console.warn('⚠️ ProfileService: DB query failed, creating minimal profile:', error.message)
      return createMinimalProfile(userId, user)
    }

    if (!data) {
      console.log('📝 ProfileService: No profile found, creating minimal profile')
      return createMinimalProfile(userId, user)
    }

    console.log('✅ ProfileService: Profile loaded successfully:', {
      name: data.full_name,
      email: data.email,
      role: data.role_system,
      isAdmin: data.is_super_admin
    })
    
    return data as Profile
    
  } catch (error) {
    console.error('❌ ProfileService: Unexpected error:', error)
    return createMinimalProfile(userId)
  }
}

const createMinimalProfile = async (userId: string, user?: any): Promise<Profile> => {
  try {
    // Si no tenemos user, obtenerlo
    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }

    const email = user?.email || ''
    
    // Determinar roles basado en email
    let role_system = 'user'
    let is_super_admin = false
    let is_admin = false
    
    // Super Admin - desarrollo
    if (email === 'eduardoarnedog@gmail.com') {
      role_system = 'super_admin'
      is_super_admin = true
      is_admin = true
    }
    // Admin - producción
    else if (email === 'eduardo@retorna.app') {
      role_system = 'admin'
      is_super_admin = true
      is_admin = true
    }
    // Otros emails de Retorna como admin
    else if (email.includes('@retorna.app')) {
      role_system = 'admin'
      is_admin = true
    }

    const profile: Profile = {
      id: userId,
      full_name: user?.user_metadata?.full_name || email.split('@')[0] || 'Usuario',
      email: email,
      area: role_system === 'admin' ? 'Administración' : 'General',
      rol_empresa: role_system === 'admin' ? 'Administrador' : 'Usuario',
      role_system: role_system,
      is_super_admin: is_super_admin,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      daily_query_limit: role_system === 'admin' ? 1000 : 50,
      queries_used_today: 0,
      last_query_reset: new Date().toISOString().split('T')[0]
    }

    console.log('🔨 ProfileService: Created minimal profile:', {
      email: profile.email,
      role: profile.role_system,
      isAdmin: is_admin,
      isSuperAdmin: is_super_admin
    })

    return profile
    
  } catch (error) {
    console.error('❌ ProfileService: Failed to create minimal profile:', error)
    
    // Perfil de emergencia absoluto
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
      last_query_reset: new Date().toISOString().split('T')[0]
    } as Profile
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  // Verificación de admin basada en email directo
  const adminEmails = [
    'eduardo@retorna.app',
    'eduardoarnedog@gmail.com'
  ]

  const isSuperAdmin = adminEmails.includes(userEmail || '') ||
                       profile?.is_super_admin === true ||
                       profile?.role_system === 'super_admin'
  
  const isAdmin = adminEmails.includes(userEmail || '') ||
                  profile?.role_system === 'admin' || 
                  profile?.role_system === 'super_admin' ||
                  isSuperAdmin ||
                  (userEmail?.includes('@retorna.app') || false)

  console.log('🔍 ProfileService: Admin status check:', {
    email: userEmail,
    profileRole: profile?.role_system,
    profileSuperAdmin: profile?.is_super_admin,
    isAdmin,
    isSuperAdmin,
    adminEmails: adminEmails.includes(userEmail || '')
  })

  return { isAdmin, isSuperAdmin }
}

// Nueva función para actualizar perfil
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ ProfileService: Update failed:', error)
      return null
    }

    console.log('✅ ProfileService: Profile updated successfully')
    return data as Profile
    
  } catch (error) {
    console.error('❌ ProfileService: Update error:', error)
    return null
  }
}
