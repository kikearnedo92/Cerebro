import { useState, useEffect, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Super admin emails - add yours here
const SUPER_ADMIN_EMAILS = ['eduardo@retorna.app', 'kike@usacerebro.com']

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  // If we're outside the provider, create standalone auth
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const currentUser = context?.user ?? user
  const currentProfile = context?.profile ?? profile

  const isAdmin = currentProfile?.role_system === 'admin' ||
    currentProfile?.role_system === 'super_admin' ||
    currentProfile?.is_super_admin ||
    SUPER_ADMIN_EMAILS.includes(currentUser?.email || '')

  const isSuperAdmin = currentProfile?.is_super_admin ||
    SUPER_ADMIN_EMAILS.includes(currentUser?.email || '')

  if (context) return { ...context, isAdmin, isSuperAdmin }

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/app`

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: userData.full_name,
          company_name: userData.company_name,
        }
      }
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
