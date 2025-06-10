
import { supabase } from '@/integrations/supabase/client'
import { SignUpData } from './types'

export const signUp = async (email: string, password: string, userData: SignUpData) => {
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

export const signIn = async (email: string, password: string) => {
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

export const signOut = async () => {
  console.log('🚪 Signing out user')
  
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('❌ Signout error:', error)
    throw error
  }
  
  console.log('✅ Signout successful')
}
