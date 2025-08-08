
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grunxkalolfyzlznungw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydW54a2Fsb2xmeXpsem51bmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjIwMDMsImV4cCI6MjA3MDIzODAwM30.Ael-v1Yi2RDuxtTdAmyL0lSxj4vT8G9lVhXOOXu04Vs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: false,
  }
})
