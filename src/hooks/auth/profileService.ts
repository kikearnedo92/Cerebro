
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      return null
    } else if (profileData) {
      console.log('✅ Profile loaded:', profileData)
      return profileData
    }
    
    return null
  } catch (error) {
    console.error('❌ Error fetching profile:', error)
    return null
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  const isAdmin = profile?.role_system === 'admin' || 
                  profile?.role_system === 'super_admin' || 
                  userEmail === 'eduardo@retorna.app'
  
  const isSuperAdmin = profile?.is_super_admin === true || 
                       profile?.role_system === 'super_admin' || 
                       userEmail === 'eduardoarnedog@gmail.com'
  
  return { isAdmin, isSuperAdmin }
}
