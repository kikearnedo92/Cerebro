import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  IntegrationId,
  ConnectedIntegration,
  IntegrationStatus,
} from '@/lib/integrations'
import { toast } from '@/hooks/use-toast'

// Maps our IntegrationId to the OAuth endpoint path and optional query
function oauthPathFor(id: IntegrationId): string {
  switch (id) {
    case 'notion':
      return '/api/integrations/notion/authorize'
    case 'google_drive':
      return '/api/integrations/google/authorize?service=drive'
    case 'gmail':
      return '/api/integrations/google/authorize?service=gmail'
    case 'google_calendar':
      return '/api/integrations/google/authorize?service=calendar'
    case 'slack':
      return '/api/integrations/slack/authorize'
    default:
      return ''
  }
}

// Maps our IntegrationId to the disconnect endpoint (one provider per id for MVP)
function disconnectPathFor(id: IntegrationId): string {
  switch (id) {
    case 'notion':
      return '/api/integrations/notion/disconnect'
    default:
      return ''
  }
}

function syncPathFor(id: IntegrationId): string {
  switch (id) {
    case 'notion':
      return '/api/integrations/notion/sync'
    default:
      return ''
  }
}

export function useIntegrations() {
  const { user, profile } = useAuth()
  const [connections, setConnections] = useState<ConnectedIntegration[]>([])
  const [loading, setLoading] = useState(true)

  const tenantId = profile?.tenant_id || ''

  const fetchConnections = useCallback(async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    try {
      // Prefer tenant_uuid (new column from migration 2026-04-19); fallback to tenant_id TEXT
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)

      if (error) {
        console.warn('Could not fetch integrations:', error.message)
        setConnections([])
      } else {
        setConnections((data || []) as unknown as ConnectedIntegration[])
      }
    } catch (err) {
      console.warn('Could not fetch integrations:', err)
      setConnections([])
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchConnections()

    // On mount, check URL for ?connected=xxx or ?error=xxx (OAuth callback result)
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const errorCode = params.get('error')
    if (connected) {
      toast({
        title: `${connected} conectado`,
        description: 'Integración conectada exitosamente. Sincronizando datos...',
      })
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (errorCode) {
      toast({
        title: 'Error al conectar',
        description: `Código: ${errorCode}. Revisa que las credenciales OAuth estén configuradas.`,
        variant: 'destructive',
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [fetchConnections])

  const getStatus = (integrationId: IntegrationId): IntegrationStatus => {
    const conn = connections.find((c) => c.integration_id === integrationId)
    return conn?.status || 'disconnected'
  }

  const getConnection = (integrationId: IntegrationId): ConnectedIntegration | undefined => {
    return connections.find((c) => c.integration_id === integrationId)
  }

  // Start OAuth flow — redirects to provider
  const connect = async (integrationId: IntegrationId) => {
    if (!tenantId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para conectar integraciones.',
        variant: 'destructive',
      })
      return
    }

    const path = oauthPathFor(integrationId)
    if (!path) {
      toast({
        title: 'Próximamente',
        description: `La integración de ${integrationId} estará disponible pronto.`,
      })
      return
    }

    // Get session token and pass it so the backend can authenticate the user
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      toast({
        title: 'Error',
        description: 'Sesión expirada. Vuelve a iniciar sesión.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Ask backend for the OAuth URL (JSON mode so we can send Bearer token)
      const separator = path.includes('?') ? '&' : '?'
      const res = await fetch(`${path}${separator}format=json`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      })
      const data = await res.json()

      if (res.ok && data.url) {
        // Navigate to provider's OAuth page
        window.location.href = data.url
      } else {
        toast({
          title: 'Error de conexión',
          description: data.error || 'No se pudo iniciar el OAuth.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Connect error:', err)
      toast({
        title: 'Error de conexión',
        description: 'No se pudo iniciar el OAuth. Intenta de nuevo.',
        variant: 'destructive',
      })
    }
  }

  const disconnect = async (integrationId: IntegrationId) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    const path = disconnectPathFor(integrationId)
    if (path) {
      try {
        await fetch(path, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      } catch (err) {
        console.warn('Disconnect endpoint failed, falling back to DB delete:', err)
      }
    } else {
      // Fallback: update row directly
      await supabase
        .from('integrations')
        .update({ status: 'disconnected', access_token_encrypted: null })
        .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)
        .eq('integration_id', integrationId)
    }

    await fetchConnections()
    toast({ title: 'Desconectado', description: 'La integración fue desconectada.' })
  }

  const syncNow = async (integrationId: IntegrationId) => {
    const conn = connections.find((c) => c.integration_id === integrationId)
    if (!conn || conn.status !== 'connected') return

    const path = syncPathFor(integrationId)
    if (!path) {
      toast({
        title: 'Sync no disponible',
        description: `El sync de ${integrationId} aún no está implementado.`,
      })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    // Optimistic UI
    setConnections((prev) =>
      prev.map((c) =>
        c.integration_id === integrationId ? { ...c, sync_status: 'syncing' as const } : c
      )
    )

    toast({
      title: 'Sincronizando...',
      description: `Importando datos de ${integrationId}. Esto puede tardar un par de minutos.`,
    })

    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        toast({
          title: 'Sincronización completa',
          description: `${data.items_synced} items importados de ${integrationId}.`,
        })
      } else {
        toast({
          title: 'Error de sincronización',
          description: data.error || 'Algo falló sincronizando.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Sync error:', err)
      toast({
        title: 'Error de sincronización',
        description: 'Revisa logs de Vercel.',
        variant: 'destructive',
      })
    } finally {
      await fetchConnections()
    }
  }

  return {
    connections,
    loading,
    getStatus,
    getConnection,
    connect,
    disconnect,
    syncNow,
    refetch: fetchConnections,
  }
}
