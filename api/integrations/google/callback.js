// Vercel serverless function: maneja el OAuth callback de Google.
// Google redirige aquí después de que el usuario autoriza.

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { code, state, error } = req.query

  if (error) {
    return res.redirect(`/app/integrations?google_error=${encodeURIComponent(error)}`)
  }

  if (!code || !state) {
    return res.redirect('/app/integrations?google_error=missing_params')
  }

  try {
    // Llamar a la Edge Function que intercambia code por tokens y guarda
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/google-drive-integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`, // user_id viene del state
      },
      body: JSON.stringify({ action: 'connect', code, user_id: state }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.redirect(`/app/integrations?google_error=${encodeURIComponent(err)}`)
    }

    return res.redirect('/app/integrations?google_connected=1')
  } catch (e) {
    return res.redirect(`/app/integrations?google_error=${encodeURIComponent(e.message)}`)
  }
}
