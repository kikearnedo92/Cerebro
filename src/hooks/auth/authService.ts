
import { supabase } from '@/integrations/supabase/client'
import { SignUpData } from './types'

export const signUp = async (email: string, password: string, userData: SignUpData) => {
  console.log('📝 AuthService: Signing up user:', email)
  
  // Validación de email más genérica - permite cualquier email empresarial válido
  if (!email.includes('@') || email.length < 5) {
    throw new Error('Ingresa un email válido')
  }

  const redirectUrl = `${window.location.origin}/chat`
  let role_system = 'user'
  
  // Solo mantener super admin para el email específico de desarrollo
  if (email === 'eduardoarnedog@gmail.com') {
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
