
import { User, Session } from '@supabase/supabase-js'
import { Profile } from '@/types/database'

export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
}

export interface SignUpData {
  full_name: string
  area: string
  rol_empresa: string
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
