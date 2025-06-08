
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxvrpnjluuvoggxonfll.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dnJwbmpsdXV2b2dneG9uZmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODAwNTMsImV4cCI6MjA2NDk1NjA1M30.hJxBEFBHXlL21vkxeMcs29MMbKUqNvIIecgJh3ZirvM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
