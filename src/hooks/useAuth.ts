
import { useState, useEffect, createContext, useContext } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'
import { fetchProfile, checkAdminStatus } from './auth/profileService'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  isAdmin: false,
  isSuperAdmin: false,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a safe default when context is not available
    return {
      user: null,
      profile: null,
      session: null,
      loading: false,
      initialized: true,
      isAdmin: false,
      isSuperAdmin: false,
      signOut: async () => {}
    }
  }
  return context
}

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const initializeAuth = async () => {
    try {
      console.log('🔄 Auth: Starting initialization...')
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Auth: Session error:', sessionError)
        setLoading(false)
        setInitialized(true)
        return
      }

      if (currentSession?.user) {
        console.log('✅ Auth: User found:', currentSession.user.email)
        setUser(currentSession.user)
        setSession(currentSession)
        
        // Try to fetch profile
        try {
          const userProfile = await fetchProfile(currentSession.user.id)
          setProfile(userProfile)
          console.log('✅ Auth: Initial profile loaded for', currentSession.user.email, ':', userProfile?.full_name, 'Role:', userProfile?.role_system)
        } catch (profileError) {
          console.error('❌ Auth: Profile loading failed:', profileError)
          // Continue without profile - app should still work
        }
      } else {
        console.log('ℹ️ Auth: No active session')
      }

      console.log('🔐 Auth: Setting up auth state listener...')
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔐 Auth: State change -', event, 'User:', session?.user?.email)
        
        setUser(session?.user ?? null)
        setSession(session)
        
        if (session?.user && event !== 'TOKEN_REFRESHED') {
          try {
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error('❌ Auth: Profile loading in state change failed:', error)
          }
        } else if (!session?.user) {
          setProfile(null)
        }
      })

      console.log('✅ Auth: Initialization complete')
      setInitialized(true)
      
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('❌ Auth: Initialization failed:', error)
      setInitialized(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeAuth()
  }, [])

  const { isAdmin, isSuperAdmin } = checkAdminStatus(profile, user?.email)

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      })
    } catch (error) {
      console.error('❌ Auth: Sign out error:', error)
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      })
    }
  }

  // Debug log current state
  useEffect(() => {
    if (initialized) {
      console.log('🔍 Auth: Current state -', {
        hasUser: !!user,
        userEmail: user?.email,
        hasSession: !!session,
        hasProfile: !!profile,
        profileName: profile?.full_name,
        profileRole: profile?.role_system,
        loading,
        initialized,
        isAdmin,
        isSuperAdmin
      })
    }
  }, [user, profile, session, loading, initialized, isAdmin, isSuperAdmin])

  return {
    user,
    profile,
    session,
    loading,
    initialized,
    isAdmin,
    isSuperAdmin,
    signOut
  }
}

export const AuthProvider = AuthContext.Provider
