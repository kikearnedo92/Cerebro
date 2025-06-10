
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
    console.log('🔐 Initializing auth...')

    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }
        
        console.log('🔐 Session loaded:', session?.user?.email || 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            try {
              const profileData = await fetchProfile(session.user.id)
              if (mounted) {
                setProfile(profileData)
              }
            } catch (profileError) {
              console.error('❌ Profile error:', profileError)
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
        }
      }
    }

    // Set up auth state listener with simplified logic
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user && event === 'SIGNED_IN') {
            try {
              const profileData = await fetchProfile(session.user.id)
              if (mounted) {
                setProfile(profileData)
              }
            } catch (error) {
              console.error('❌ Profile fetch error:', error)
              if (mounted) {
                setProfile(null)
              }
            }
          } else if (!session) {
            setProfile(null)
          }
          
          if (event !== 'INITIAL_SESSION') {
            setLoading(false)
          }
        }
      }
    )

    // Initialize with timeout fallback
    const initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('⚠️ Auth timeout, stopping loading')
        setLoading(false)
      }
    }, 8000)

    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(initTimeout)
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
