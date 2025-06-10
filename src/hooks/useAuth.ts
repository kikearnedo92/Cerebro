
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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    console.log('🔐 Initializing auth...')

    let mounted = true
    let authSubscription: any = null

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 Auth event:', event, 'Session user:', session?.user?.email || 'No session')
            
            if (!mounted) return

            setSession(session)
            setUser(session?.user ?? null)
            
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              console.log('👤 Fetching profile for user:', session.user.email)
              try {
                const profileData = await fetchProfile(session.user.id)
                if (mounted) {
                  setProfile(profileData)
                  console.log('✅ Profile loaded:', profileData?.full_name)
                }
              } catch (error) {
                console.error('❌ Profile fetch error:', error)
                if (mounted) {
                  setProfile(null)
                }
              }
            } else if (!session || event === 'SIGNED_OUT') {
              console.log('🚪 User signed out, clearing profile')
              if (mounted) {
                setProfile(null)
              }
            }
            
            // Set loading to false after processing any auth event
            if (mounted && initialized) {
              setLoading(false)
            }
          }
        )

        // Then get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
          return
        }
        
        console.log('🔐 Initial session loaded:', currentSession?.user?.email || 'No session')
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setInitialized(true)
          
          if (currentSession?.user) {
            try {
              const profileData = await fetchProfile(currentSession.user.id)
              if (mounted) {
                setProfile(profileData)
                console.log('✅ Initial profile loaded:', profileData?.full_name)
              }
            } catch (profileError) {
              console.error('❌ Initial profile error:', profileError)
              if (mounted) {
                setProfile(null)
              }
            }
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Add a safety timeout
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('⚠️ Auth safety timeout, stopping loading')
        setLoading(false)
        setInitialized(true)
      }
    }, 10000) // Increased to 10 seconds

    initializeAuth()

    return () => {
      console.log('🧹 Cleaning up auth hook')
      mounted = false
      clearTimeout(safetyTimeout)
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, []) // Empty dependency array - only run once

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    await authSignUp(email, password, userData)
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting signIn process for:', email)
    await authSignIn(email, password)
  }

  const signOut = async () => {
    console.log('🚪 Starting signOut process')
    try {
      await authSignOut()
      // Clear state immediately
      setUser(null)
      setSession(null)
      setProfile(null)
      console.log('✅ SignOut completed successfully')
    } catch (error) {
      console.error('❌ SignOut error:', error)
      // Even if there's an error, clear the local state
      setUser(null)
      setSession(null)
      setProfile(null)
      throw error
    }
  }

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

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
