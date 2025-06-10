
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
    console.log('🔐 Initializing auth system...')
    
    let mounted = true
    
    // Timeout de seguridad para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Loading timeout reached, setting loading to false')
        setLoading(false)
      }
    }, 5000)

    const updateAuthState = async (currentSession: Session | null) => {
      if (!mounted) return
      
      console.log('🔄 Updating auth state, session:', !!currentSession, 'user:', currentSession?.user?.email)
      
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      
      if (currentSession?.user) {
        console.log('👤 User found, fetching profile...')
        try {
          const profileData = await fetchProfile(currentSession.user.id)
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
      } else {
        console.log('🚫 No user, clearing profile')
        if (mounted) {
          setProfile(null)
        }
      }
      
      if (mounted) {
        setLoading(false)
        clearTimeout(loadingTimeout)
      }
    }

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, 'Session user:', session?.user?.email || 'No user')
      await updateAuthState(session)
    })

    // Obtener sesión inicial
    const initializeSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          if (mounted) {
            setLoading(false)
            clearTimeout(loadingTimeout)
          }
          return
        }
        
        console.log('🔐 Initial session check:', currentSession?.user?.email || 'No session')
        await updateAuthState(currentSession)
      } catch (error) {
        console.error('❌ Session initialization error:', error)
        if (mounted) {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
    }

    initializeSession()

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth subscription')
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    console.log('📝 Starting signup process for:', email)
    await authSignUp(email, password, userData)
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting signin process for:', email)
    setLoading(true)
    try {
      const result = await authSignIn(email, password)
      console.log('✅ Signin completed, result:', result.user?.email)
      return result
    } catch (error) {
      console.error('❌ Signin error:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log('🚪 Starting signout process')
    setLoading(true)
    try {
      await authSignOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      console.log('✅ Signout completed')
    } catch (error) {
      console.error('❌ Signout error:', error)
      setUser(null)
      setSession(null)
      setProfile(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

  console.log('🔍 Current auth state:', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    hasProfile: !!profile,
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
