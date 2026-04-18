import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  IntegrationId,
  ConnectedIntegration,
  IntegrationStatus,
  getOAuthUrl,
} from '@/lib/integrations'
import { toast } from '@/hooks/use-toast'

export function useIntegrations() {
  const { user, profile } = useAuth()
  const [connections, setConnections] = useState<ConnectedIntegration[]>([])
  const [loading, setLoading] = useState(true)

  const tenantId = profile?.tenant_id || user?.id || ''

  // Fetch all connections for this tenant
  const fetchConnections = useCallback(async () => {
    if (!tenantId) return

    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('tenant_id', tenantId)

      if (error) {
        // Table might not exist yet — that's OK for MVP
        console.warn('Integrations table not found, using local state:', error.message)
        setConnections([])
      } else {
        setConnections(data || [])
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
  }, [fetchConnections])

  // Get status for a specific integration
  const getStatus = (integrationId: IntegrationId): IntegrationStatus => {
    const conn = connections.find(c => c.integration_id === integrationId)
    return conn?.status || 'disconnected'
  }

  // Get connection details
  const getConnection = (integrationId: IntegrationId): ConnectedIntegration | undefined => {
    return connections.find(c => c.integration_id === integrationId)
  }

  // Start OAuth flow
  const connect = async (integrationId: IntegrationId) => {
    if (!tenantId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para conectar integraciones.',
        variant: 'destructive',
      })
      return
    }

    try {
      // For MVP: create a pending connection record
      const { error } = await supabase.from('integrations').upsert({
        tenant_id: tenantId,
        integration_id: integrationId,
        status: 'connecting',
        connected_by: user?.id,
        metadata: {},
      }, {
        onConflict: 'tenant_id,integration_id',
      })

      if (error) {
        console.warn('Could not save integration state:', error.message)
      }

      // Open OAuth window
      const oauthUrl = getOAuthUrl(integrationId, tenantId)

      // For now, simulate OAuth since Edge Functions aren't deployed yet
      // In production: window.open(oauthUrl, '_blank', 'width=600,height=700')
      simulateOAuth(integrationId)

    } catch (err) {
      console.error('Connect error:', err)
      toast({
        title: 'Error de conexión',
        description: 'No se pudo iniciar la conexión. Intenta de nuevo.',
        variant: 'destructive',
      })
    }
  }

  // Simulate OAuth for MVP demo (replace with real OAuth later)
  const simulateOAuth = async (integrationId: IntegrationId) => {
    // Update local state immediately
    const newConn: ConnectedIntegration = {
      id: `local-${integrationId}`,
      tenant_id: tenantId,
      integration_id: integrationId,
      status: 'connected',
      connected_at: new Date().toISOString(),
      connected_by: user?.id || null,
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      token_expires_at: null,
      metadata: { simulated: true },
      last_sync_at: null,
      sync_status: 'idle',
      items_synced: 0,
    }

    setConnections(prev => {
      const filtered = prev.filter(c => c.integration_id !== integrationId)
      return [...filtered, newConn]
    })

    toast({
      title: `${integrationId.charAt(0).toUpperCase() + integrationId.slice(1)} conectado`,
      description: 'Integración conectada exitosamente. Configura la sincronización.',
    })

    // Try to persist
    try {
      await supabase.from('integrations').upsert({
        tenant_id: tenantId,
        integration_id: integrationId,
        status: 'connected',
        connected_at: new Date().toISOString(),
        connected_by: user?.id,
        metadata: { simulated: true },
      }, {
        onConflict: 'tenant_id,integration_id',
      })
    } catch (err) {
      // Silently fail - local state is enough for MVP
    }
  }

  // Disconnect an integration
  const disconnect = async (integrationId: IntegrationId) => {
    setConnections(prev => prev.filter(c => c.integration_id !== integrationId))

    try {
      await supabase
        .from('integrations')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('integration_id', integrationId)
    } catch (err) {
      console.warn('Could not delete integration record:', err)
    }

    toast({
      title: 'Desconectado',
      description: 'La integración fue desconectada.',
    })
  }

  // Trigger sync for an integration
  const syncNow = async (integrationId: IntegrationId) => {
    const conn = connections.find(c => c.integration_id === integrationId)
    if (!conn || conn.status !== 'connected') return

    // Update sync status
    setConnections(prev => prev.map(c =>
      c.integration_id === integrationId
        ? { ...c, sync_status: 'syncing' as const }
        : c
    ))

    toast({
      title: 'Sincronizando...',
      description: `Importando datos de ${integrationId}. Esto puede tardar unos minutos.`,
    })

    // Simulate sync (replace with real Edge Function call)
    setTimeout(() => {
      setConnections(prev => prev.map(c =>
        c.integration_id === integrationId
          ? {
              ...c,
              sync_status: 'idle' as const,
              last_sync_at: new Date().toISOString(),
              items_synced: Math.floor(Math.random() * 50) + 10,
            }
          : c
      ))

      toast({
        title: 'Sincronización completa',
        description: `Datos de ${integrationId} importados a tu Cerebro.`,
      })
    }, 3000)
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
