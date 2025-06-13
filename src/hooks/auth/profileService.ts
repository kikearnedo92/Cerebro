
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
      console.error('❌ ProfileService: Error fetching profile:', error)
      
      // Si no existe el perfil, crear uno básico
      if (error.code === 'PGRST116') {
        console.log('👤 ProfileService: Profile not found, creating basic profile')
        
        // Obtener información básica del usuario
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('❌ ProfileService: No user found for profile creation')
          return null
        }

        // Determinar rol según email
        let role_system = 'user'
        let is_super_admin = false
        
        if (user.email === 'eduardoarnedog@gmail.com') {
          role_system = 'super_admin'
          is_super_admin = true
        } else if (user.email === 'eduardo@retorna.app') {
          role_system = 'admin'
        }

        const newProfile = {
          id: userId,
          full_name: user.email?.split('@')[0] || 'Usuario',
          email: user.email || '',
          area: 'Sin asignar',
          rol_empresa: user.email === 'eduardo@retorna.app' ? 'Director' : 'user',
          role_system: role_system,
          is_super_admin: is_super_admin,
          created_at: new Date().toISOString()
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error('❌ ProfileService: Error creating profile:', createError)
          return null
        }

        console.log('✅ ProfileService: Basic profile created:', createdProfile)
        return createdProfile as Profile
      }
      
      return null
    }

    console.log('✅ ProfileService: Profile loaded:', data?.full_name, 'Role:', data?.role_system)
    return data as Profile
  } catch (error) {
    console.error('❌ ProfileService: Profile fetch failed:', error)
    return null
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  // Verificar super admin por email específico o por perfil
  const isSuperAdmin = userEmail === 'eduardoarnedog@gmail.com' || 
                       profile?.is_super_admin === true ||
                       profile?.role_system === 'super_admin'
  
  // Verificar admin por role_system en el perfil o email específico
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
