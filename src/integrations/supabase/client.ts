import { createClient } from '@supabase/supabase-js'

// Supabase config - anon key is public (safe to include as fallback)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://begnklspqjxwkvwhuefr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZ25rbHNwcWp4d2t2d2h1ZWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Mjg3MjksImV4cCI6MjA5MjEwNDcyOX0.5_5hvmAAbc8UbZ863nvwkgmD8-9QcuCLIijgvwFbT6I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
