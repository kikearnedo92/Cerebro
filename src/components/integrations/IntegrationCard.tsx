import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  Loader2,
  Plug,
  RefreshCw,
  Unplug,
  Clock,
  Database,
} from 'lucide-react'
import { Integration, ConnectedIntegration, IntegrationStatus } from '@/lib/integrations'

interface IntegrationCardProps {
  integration: Integration
  connection?: ConnectedIntegration
  status: IntegrationStatus
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => void
}

const statusConfig: Record<IntegrationStatus, { label: string; variant: string; icon: React.ReactNode }> = {
  disconnected: {
    label: 'Desconectado',
    variant: 'outline',
    icon: <Unplug className="w-3 h-3" />,
  },
  connecting: {
    label: 'Conectando...',
    variant: 'secondary',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  connected: {
    label: 'Conectado',
    variant: 'default',
    icon: <Check className="w-3 h-3" />,
  },
  error: {
    label: 'Error',
    variant: 'destructive',
    icon: <Unplug className="w-3 h-3" />,
  },
}

export default function IntegrationCard({
  integration,
  connection,
  status,
  onConnect,
  onDisconnect,
  onSync,
}: IntegrationCardProps) {
  const isConnected = status === 'connected'
  const isSyncing = connection?.sync_status === 'syncing'
  const statusInfo = statusConfig[status]

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className={`transition-all duration-200 ${isConnected ? 'ring-2 ring-indigo-200 bg-indigo-50/30' : 'hover:shadow-md'}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${integration.color} flex items-center justify-center text-white text-2xl shadow-sm`}>
              {integration.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{integration.name}</h3>
              <Badge
                variant={statusInfo.variant as any}
                className={`text-xs mt-1 ${isConnected ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
              >
                <span className="mr-1">{statusInfo.icon}</span>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4">{integration.description}</p>

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {integration.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isConnected ? 'text-green-500' : 'text-slate-300'}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Sync info (only when connected) */}
        {isConnected && connection && (
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4 space-y-1">
            {connection.last_sync_at && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Último sync: {formatDate(connection.last_sync_at)}</span>
              </div>
            )}
            {connection.items_synced > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Database className="w-3 h-3" />
                <span>{connection.items_synced} elementos indexados</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                onClick={onSync}
                disabled={isSyncing}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                size="sm"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </Button>
              <Button
                onClick={onDisconnect}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Unplug className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={onConnect}
              disabled={status === 'connecting'}
              className="w-full bg-slate-900 hover:bg-slate-800"
              size="sm"
            >
              {status === 'connecting' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plug className="w-4 h-4 mr-2" />
              )}
              {status === 'connecting' ? 'Conectando...' : 'Conectar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
