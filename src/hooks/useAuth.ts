
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

    let mounted = true

    const fetchProfile = async (userId: string) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (mounted) {
          if (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            setProfile(null)
          } else if (profileData) {
            console.log('✅ Profile loaded:', profileData)
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error)
        if (mounted) {
          setProfile(null)
        }
      }
    }

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }
        
        console.log('🔐 Initial session:', session?.user?.email || 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email || 'No session')
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user && event !== 'INITIAL_SESSION') {
            await fetchProfile(session.user.id)
          } else if (!session) {
            console.log('🚪 User signed out')
            setProfile(null)
          }
          
          if (event !== 'INITIAL_SESSION') {
            setLoading(false)
          }
        }
      }
    )

    // Initialize auth state
    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to run only once

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    area: string
    rol_empresa: string
  }) => {
    console.log('📝 Signing up user:', email)
    
    if (!email.endsWith('@retorna.app') && email !== 'eduardoarnedog@gmail.com') {
      throw new Error('Solo se permiten emails con dominio @retorna.app o eduardoarnedog@gmail.com')
    }

    const redirectUrl = `${window.location.origin}/chat`
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

  const isAdmin = profile?.role_system === 'admin' || profile?.role_system === 'super_admin' || user?.email === 'eduardo@retorna.app'
  const isSuperAdmin = profile?.is_super_admin === true || profile?.role_system === 'super_admin' || user?.email === 'eduardoarnedog@gmail.com'

  console.log('🔍 Auth state:', { 
    user: user?.email, 
    profile: profile?.role_system, 
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
