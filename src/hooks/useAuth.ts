
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

    // Función para actualizar el estado de autenticación
    const updateAuthState = async (session: Session | null) => {
      console.log('🔄 Updating auth state, session exists:', !!session, 'user:', session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('👤 User found, fetching profile...')
        try {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
          console.log('✅ Profile loaded:', profileData?.full_name)
        } catch (error) {
          console.error('❌ Profile fetch error:', error)
          setProfile(null)
        }
      } else {
        console.log('🚫 No user, clearing profile')
        setProfile(null)
      }
      
      setLoading(false)
    }

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, 'Session user:', session?.user?.email || 'No user')
      await updateAuthState(session)
    })

    // Obtener sesión inicial
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          setLoading(false)
          return
        }
        
        console.log('🔐 Initial session check:', currentSession?.user?.email || 'No session')
        await updateAuthState(currentSession)
      } catch (error) {
        console.error('❌ Session initialization error:', error)
        setLoading(false)
      }
    }

    initializeSession()

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up auth subscription')
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
      // No necesitamos actualizar el estado aquí, onAuthStateChange lo hará
      return result
    } finally {
      // Solo quitamos loading si no hay usuario (error case)
      setTimeout(() => {
        if (!user) {
          setLoading(false)
        }
      }, 1000)
    }
  }

  const signOut = async () => {
    console.log('🚪 Starting signout process')
    setLoading(true)
    try {
      await authSignOut()
      // Limpiar estado inmediatamente
      setUser(null)
      setSession(null)
      setProfile(null)
      console.log('✅ Signout completed')
    } catch (error) {
      console.error('❌ Signout error:', error)
      // Limpiar estado incluso si hay error
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
