
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
        const { data: { session }, error } = await supabase.auth.getSession()
        
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
          } else if (!session || event === 'SIGNED_OUT') {
            console.log('🚪 User signed out, clearing profile')
            setProfile(null)
          }
          
          if (event !== 'INITIAL_SESSION') {
            setLoading(false)
          }
        }
      }
    )

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
