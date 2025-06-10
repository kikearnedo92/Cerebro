
import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 Setting up auth listener...')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              console.log('👤 Fetching profile for:', session.user.email)
              
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              if (profileError) {
                console.error('❌ Profile fetch error:', profileError)
              } else if (profileData) {
                console.log('✅ Profile loaded:', profileData)
                setProfile(profileData)
              }
            } catch (error) {
              console.error('❌ Error fetching profile:', error)
            }
          }, 100)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      if (!session) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    area: string
    rol_empresa: string
  }) => {
    console.log('📝 Signing up user:', email)
    
    // SOLO permitir emails @retorna.app o eduardoarnedog@gmail.com
    if (!email.endsWith('@retorna.app') && email !== 'eduardoarnedog@gmail.com') {
      throw new Error('Solo se permiten emails con dominio @retorna.app o eduardoarnedog@gmail.com')
    }

    const redirectUrl = `${window.location.origin}/dashboard`
    // eduardo@retorna.app es admin automático, eduardoarnedog@gmail.com es super_admin
    let role_system = 'user'
    if (email === 'eduardo@retorna.app') {
      role_system = 'admin'
    } else if (email === 'eduardoarnedog@gmail.com') {
      role_system = 'super_admin'
    }
    
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

    if (error) {
      console.error('❌ Signup error:', error)
      throw error
    }
    
    console.log('✅ Signup successful')
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Signing in user:', email)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Signin error:', error)
      throw error
    }
    
    console.log('✅ Signin successful')
  }

  const signOut = async () => {
    console.log('🚪 Signing out user')
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('❌ Signout error:', error)
      throw error
    }
    
    setUser(null)
    setSession(null)
    setProfile(null)
    
    console.log('✅ Signout successful')
  }

  const isAdmin = profile?.role_system === 'admin' || user?.email === 'eduardo@retorna.app'
  const isSuperAdmin = profile?.is_super_admin === true || profile?.role_system === 'super_admin'

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
