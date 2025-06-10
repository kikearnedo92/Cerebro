
import { supabase } from '@/integrations/supabase/client'
import { SignUpData } from './types'

export const signUp = async (email: string, password: string, userData: SignUpData) => {
  console.log('📝 AuthService: Signing up user:', email)
  
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
  
  const { data, error } = await supabase.auth.signUp({
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
    console.error('❌ AuthService: Signup error:', error)
    throw error
  }
  
  console.log('✅ AuthService: Signup successful')
  return data
}

export const signIn = async (email: string, password: string) => {
  console.log('🔑 AuthService: Attempting signin for:', email)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('❌ AuthService: Signin error:', error)
    throw error
  }
  
  console.log('✅ AuthService: Signin successful for:', data.user?.email)
  return data
}

export const signOut = async () => {
  console.log('🚪 AuthService: Attempting signout')
  
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ AuthService: Signout error:', error)
    throw error
  }
  
  console.log('✅ AuthService: Signout successful')
}
