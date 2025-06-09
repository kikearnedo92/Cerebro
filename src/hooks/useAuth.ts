
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Session timeout - 2 hours
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Update last login
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id)

          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileData) {
              setProfile(profileData)
              
              // Check session timeout
              if (profileData.last_login) {
                const lastLogin = new Date(profileData.last_login).getTime()
                const now = new Date().getTime()
                
                if (now - lastLogin > SESSION_TIMEOUT) {
                  toast({
                    title: "Sesión expirada",
                    description: "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.",
                    variant: "destructive"
                  })
                  await signOut()
                  return
                }
              }
            }
          }, 0)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    area: string
    rol_empresa: string
  }) => {
    // Validate email domain
    if (!email.endsWith('@retorna.app')) {
      throw new Error('Solo se permiten emails con dominio @retorna.app')
    }

    const redirectUrl = `${window.location.origin}/`
    
    // Determine role based on email
    const role_system = email === 'eduardo@retorna.app' ? 'admin' : 'user'
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          ...userData,
          role_system
        }
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
    
    // Clear local state
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  }
}
