import { createClient } from '@supabase/supabase-js'

// Supabase config - anon key is public (safe to include as fallback)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jxvrpnjluuvoggxonfll.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dnJwbmpsdXV2b2dneG9uZmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODAwNTMsImV4cCI6MjA2NDk1NjA1M30.hJxBEFBHXlL21vkxeMcs29MMbKUqNvIIecgJh3ZirvM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
