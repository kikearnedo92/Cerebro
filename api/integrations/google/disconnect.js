// POST /api/integrations/google/disconnect
// Borra/cancela la integración de Google Drive (o cualquier google_*).
// Funciona tanto si está 'connecting', 'connected' o 'error'.

import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { decryptToken } from '../_lib/crypto.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const ctx = await getAuthContext(req)
    if (!ctx) return res.status(401).json({ error: 'Not authenticated' })
    if (!ctx.isAdmin) return res.status(403).json({ error: 'Only tenant admins can disconnect integrations' })

    const { service = 'drive' } = req.body || {}
    const integrationId =
      service === 'drive' ? 'google_drive' :
      service === 'gmail' ? 'gmail' :
      service === 'calendar' ? 'google_calendar' :
      'google_drive'

    const admin = supabaseAdmin()

    // Buscar el row para revocar token y luego borrar
    const { data: row } = await admin
      .from('integrations')
      .select('id, access_token_encrypted')
      .or(`tenant_uuid.eq.${ctx.tenantId},tenant_id.eq.${ctx.tenantId}`)
      .eq('integration_id', integrationId)
      .maybeSingle()

    if (row?.access_token_encrypted) {
      try {
        const token = decryptToken(row.access_token_encrypted)
        if (token) {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST',
          }).catch(() => {})
        }
      } catch (e) {
        console.warn('Could not revoke Google token:', e)
      }
    }

    // Reset del row a disconnected (no eliminar — preserva metadata histórica)
    await admin
      .from('integrations')
      .update({
        status: 'disconnected',
        access_token_encrypted: null,
        refresh_token_encrypted: null,
        oauth_state: null,
        last_error: null,
      })
      .or(`tenant_uuid.eq.${ctx.tenantId},tenant_id.eq.${ctx.tenantId}`)
      .eq('integration_id', integrationId)

    return res.json({ success: true })
  } catch (err) {
    console.error('google/disconnect error:', err)
    return res.status(500).json({ error: err.message || 'Internal error' })
  }
}
