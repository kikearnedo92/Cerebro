
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
    console.log('🔐 Auth: Starting initialization...')
    
    let mounted = true
    
    // Función para actualizar el estado de auth
    const updateAuthState = async (currentSession: Session | null) => {
      if (!mounted) return
      
      console.log('🔄 Auth: Updating state -', currentSession ? `User: ${currentSession.user.email}` : 'No session')
      
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      
      if (currentSession?.user) {
        try {
          console.log('👤 Auth: Fetching profile for user:', currentSession.user.id)
          const profileData = await fetchProfile(currentSession.user.id)
          if (mounted) {
            setProfile(profileData)
            console.log('✅ Auth: Profile loaded:', profileData?.full_name || 'No name')
          }
        } catch (error) {
          console.error('❌ Auth: Profile fetch error:', error)
          if (mounted) setProfile(null)
        }
      } else {
        if (mounted) setProfile(null)
      }
      
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
    }

    // Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth: State change -', event, session ? `User: ${session.user.email}` : 'No session')
      if (mounted) {
        await updateAuthState(session)
      }
    })

    // Obtener sesión inicial
    const initializeAuth = async () => {
      try {
        console.log('🔍 Auth: Getting initial session...')
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Auth: Session error:', error)
          if (mounted) {
            setLoading(false)
            setInitialized(true)
          }
          return
        }
        
        console.log('🔐 Auth: Initial session -', initialSession ? `User: ${initialSession.user.email}` : 'No session')
        await updateAuthState(initialSession)
      } catch (error) {
        console.error('❌ Auth: Init error:', error)
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Timeout de seguridad
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.log('⚠️ Auth: Safety timeout - forcing loading false')
        setLoading(false)
        setInitialized(true)
      }
    }, 3000)

    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
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
    setLoading(true)
    try {
      await authSignOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      console.log('✅ Auth: Signout successful')
    } catch (error) {
      console.error('❌ Auth: Signout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

  console.log('🔍 Auth: Current state -', {
    hasUser: !!user,
    userEmail: user?.email,
    hasSession: !!session,
    hasProfile: !!profile,
    loading,
    initialized,
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
