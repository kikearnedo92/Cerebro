
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log('👤 ProfileService: Fetching profile for user:', userId)
  
  try {
    // Use direct query without RLS for profile fetching
    const { data, error } = await supabase
      .rpc('get_user_profile_safe', { user_uid: userId })

    if (error) {
      console.error('❌ ProfileService: Profile RPC error:', error)
      
      // Fallback to basic profile creation
      console.log('👤 ProfileService: Creating basic profile as fallback')
      return await createBasicProfile(userId)
    }

    if (!data || data.length === 0) {
      console.log('👤 ProfileService: No profile found, creating basic profile')
      return await createBasicProfile(userId)
    }

    const profile = data[0] as Profile
    console.log('✅ ProfileService: Profile loaded:', profile?.full_name, 'Role:', profile?.role_system)
    return profile
  } catch (error) {
    console.error('❌ ProfileService: Profile fetch failed:', error)
    
    // Final attempt: create basic profile
    console.log('👤 ProfileService: Final attempt - creating basic profile')
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
    
    // Set admin status for specific email
    if (user.email === 'eduardo@retorna.app') {
      role_system = 'admin'
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

    // Try to insert/update profile
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(newProfile, { onConflict: 'id' })
      .select()
      .single()

    if (createError) {
      console.error('❌ ProfileService: Error creating profile:', createError)
      // Return the profile data anyway for the app to work
      return newProfile as Profile
    }

    console.log('✅ ProfileService: Basic profile created/updated:', createdProfile)
    return createdProfile as Profile
  } catch (error) {
    console.error('❌ ProfileService: Failed to create basic profile:', error)
    
    // Return a minimal profile so the app doesn't break
    const { data: { user } } = await supabase.auth.getUser()
    return {
      id: userId,
      full_name: user?.email?.split('@')[0] || 'Usuario',
      email: user?.email || '',
      area: 'General',
      rol_empresa: 'Usuario',
      role_system: user?.email === 'eduardo@retorna.app' ? 'admin' : 'user',
      is_super_admin: user?.email === 'eduardo@retorna.app',
      created_at: new Date().toISOString()
    } as Profile
  }
}

export const checkAdminStatus = (profile: Profile | null, userEmail?: string) => {
  const isSuperAdmin = userEmail === 'eduardo@retorna.app' || 
                       profile?.is_super_admin === true ||
                       profile?.role_system === 'super_admin' ||
                       profile?.role_system === 'admin'
  
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
