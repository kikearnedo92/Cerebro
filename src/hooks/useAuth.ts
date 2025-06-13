
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'
import { fetchProfile, checkAdminStatus } from './auth/profileService'
import { signUp as authSignUp, signIn as authSignIn, signOut as authSignOut } from './auth/authService'
import { SignUpData } from './auth/types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 Auth: Initializing useAuth hook...')
    
    let mounted = true

    // Get initial session first
    const getInitialSession = async () => {
      try {
        console.log('🔐 Auth: Getting initial session...')
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Auth: Error getting initial session:', error)
          if (mounted) setLoading(false)
          return
        }
        
        console.log('🔐 Auth: Initial session -', initialSession ? `User: ${initialSession.user.email}` : 'No session')
        
        if (!mounted) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession?.user) {
          console.log('👤 Auth: Initial session has user, fetching profile...')
          try {
            const profileData = await fetchProfile(initialSession.user.id)
            if (mounted) {
              setProfile(profileData)
              console.log('✅ Auth: Initial profile loaded for', initialSession.user.email, ':', profileData?.full_name, 'Role:', profileData?.role_system)
            }
          } catch (error) {
            console.error('❌ Auth: Initial profile fetch error:', error)
            if (mounted) setProfile(null)
          }
        } else {
          console.log('👤 Auth: No initial session user')
          if (mounted) setProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
          console.log('✅ Auth: Initial loading complete')
        }
      } catch (error) {
        console.error('❌ Auth: Initialization error:', error)
        if (mounted) setLoading(false)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth: State change -', event, session ? `User: ${session.user.email}` : 'No session')
      
      if (!mounted) {
        console.log('🔐 Auth: Component unmounted, ignoring state change')
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('👤 Auth: User signed in, fetching profile for:', session.user.email)
        try {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
            console.log('✅ Auth: Profile loaded after signin:', profileData?.full_name, 'Role:', profileData?.role_system)
          }
        } catch (error) {
          console.error('❌ Auth: Profile fetch error after signin:', error)
          if (mounted) setProfile(null)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Auth: User signed out, clearing profile')
        if (mounted) setProfile(null)
      }
      
      // Set loading to false after any auth state change
      if (mounted) {
        setLoading(false)
        console.log('✅ Auth: Loading set to false after state change')
      }
    })

    // Start initialization
    getInitialSession()

    return () => {
      console.log('🔐 Auth: Cleaning up useAuth hook')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    console.log('📝 Auth: Starting signup for:', email)
    return await authSignUp(email, password, userData)
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Auth: Starting signin for:', email)
    setLoading(true)
    try {
      const result = await authSignIn(email, password)
      console.log('✅ Auth: Signin successful')
      return result
    } catch (error) {
      console.error('❌ Auth: Signin error:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log('🚪 Auth: Starting signout')
    try {
      await authSignOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      console.log('✅ Auth: Signout successful')
    } catch (error) {
      console.error('❌ Auth: Signout error:', error)
      throw error
    }
  }

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

  console.log('🔍 Auth: Current state -', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    hasProfile: !!profile,
    profileName: profile?.full_name,
    profileRole: profile?.role_system,
    loading,
    isAdmin,
    isSuperAdmin
  })

  return {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isSuperAdmin,
    signUp,
    signIn,
    signOut
  }
}
