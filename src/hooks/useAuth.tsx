
import { useState, useEffect, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { AuthState, AuthContextType, SignUpData } from './auth/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin'
  const isSuperAdmin = profile?.is_super_admin || profile?.email === 'eduardo@retorna.app'

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Profile fetch error:', error)
      } else {
        console.log('✅ Profile loaded:', profileData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('❌ Profile error:', error)
    }
  }

  // Determine current app based on URL
  const getCurrentApp = () => {
    const path = window.location.pathname
    if (path.startsWith('/cerebro')) return 'cerebro'
    if (path.startsWith('/nucleo')) return 'nucleo'
    return null
  }

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, !!session)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile immediately
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', !!session)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    })
    
    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}
