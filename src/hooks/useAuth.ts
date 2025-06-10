
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
    console.log('🔐 Setting up auth listener...')

    let mounted = true

    const handleProfileFetch = async (userId: string) => {
      const profileData = await fetchProfile(userId)
      if (mounted) {
        setProfile(profileData)
        setLoading(false)
      }
    }

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }
        
        console.log('🔐 Initial session:', session?.user?.email || 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Fetch profile for authenticated user
            await handleProfileFetch(session.user.id)
          } else {
            // No user, stop loading
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user && event !== 'INITIAL_SESSION') {
            // Fetch profile for newly authenticated user
            await handleProfileFetch(session.user.id)
          } else if (!session) {
            console.log('🚪 User signed out')
            setProfile(null)
            setLoading(false)
          }
        }
      }
    )

    // Initialize auth state
    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    await authSignUp(email, password, userData)
  }

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password)
  }

  const signOut = async () => {
    await authSignOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

  console.log('🔍 Auth state:', { 
    user: user?.email, 
    profile: profile?.role_system, 
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
