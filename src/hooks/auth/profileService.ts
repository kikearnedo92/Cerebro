
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log('👤 ProfileService: Fetching profile for user:', userId)
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ ProfileService: Profile query error:', error)
      
      // Si no existe el perfil, crear uno básico
      if (error.code === 'PGRST116') {
        console.log('👤 ProfileService: Profile not found, creating basic profile')
        return await createBasicProfile(userId)
      }
      
      return null
    }

    console.log('✅ ProfileService: Profile loaded:', data?.full_name, 'Role:', data?.role_system)
    return data as Profile
  } catch (error) {
    console.error('❌ ProfileService: Profile fetch failed:', error)
    
    // Último intento: crear perfil básico
    console.log('👤 ProfileService: Last attempt - creating basic profile')
    return await createBasicProfile(userId)
  }
}

const createBasicProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('❌ ProfileService: No user found for profile creation')
      return null
    }

    let role_system = 'user'
    let is_super_admin = false
    
    if (user.email === 'eduardo@retorna.app') {
      role_system = 'super_admin'
      is_super_admin = true
    }

    const newProfile = {
      id: userId,
      full_name: user.email?.split('@')[0] || 'Usuario',
      email: user.email || '',
      area: 'General',
      rol_empresa: user.email === 'eduardo@retorna.app' ? 'Director' : 'Usuario',
      role_system: role_system,
      is_super_admin: is_super_admin,
      created_at: new Date().toISOString()
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(newProfile, { onConflict: 'id' })
      .select()
      .single()

    if (createError) {
      console.error('❌ ProfileService: Error creating profile:', createError)
      return null
    }

    console.log('✅ ProfileService: Basic profile created:', createdProfile)
    return createdProfile as Profile
  } catch (error) {
    console.error('❌ ProfileService: Failed to create basic profile:', error)
    return null
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  const isSuperAdmin = userEmail === 'eduardo@retorna.app' || 
                       profile?.is_super_admin === true ||
                       profile?.role_system === 'super_admin'
  
  const isAdmin = profile?.role_system === 'admin' || 
                  profile?.role_system === 'super_admin' ||
                  userEmail === 'eduardo@retorna.app' ||
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
