// Integration definitions and OAuth configuration
// Each integration uses OAuth2 - the client connects THEIR accounts

export type IntegrationId = 'notion' | 'slack' | 'google_drive' | 'gmail' | 'google_calendar'

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface Integration {
  id: IntegrationId
  name: string
  description: string
  icon: string // emoji or icon name
  color: string // tailwind color class
  features: string[]
  oauthUrl?: string
  scopes: string[]
  category: 'knowledge' | 'communication' | 'productivity'
}

export interface ConnectedIntegration {
  id: string
  tenant_id: string
  integration_id: IntegrationId
  status: IntegrationStatus
  connected_at: string | null
  connected_by: string | null
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  token_expires_at: string | null
  metadata: Record<string, any>
  last_sync_at: string | null
  sync_status: 'idle' | 'syncing' | 'error' | null
  items_synced: number
}

export const INTEGRATIONS: Integration[] = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sincroniza páginas, bases de datos y wikis de Notion con tu Cerebro.',
    icon: '📝',
    color: 'bg-gray-900',
    category: 'knowledge',
    features: [
      'Importar páginas y databases automáticamente',
      'Búsqueda semántica en tu contenido de Notion',
      'Sync automático cuando actualizas contenido',
    ],
    scopes: ['read_content', 'read_databases'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Conecta Slack para buscar conversaciones y conocimiento de tu equipo.',
    icon: '💬',
    color: 'bg-purple-600',
    category: 'communication',
    features: [
      'Buscar en canales públicos y privados',
      'Indexar decisiones y contexto de equipo',
      'Respuestas basadas en conversaciones reales',
    ],
    scopes: ['channels:read', 'search:read', 'users:read'],
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Indexa documentos, hojas de cálculo y presentaciones de Google Drive.',
    icon: '📁',
    color: 'bg-green-600',
    category: 'knowledge',
    features: [
      'Indexar Docs, Sheets y Slides',
      'Búsqueda por contenido dentro de archivos',
      'Sync automático de carpetas seleccionadas',
    ],
    scopes: ['drive.readonly', 'drive.metadata.readonly'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Busca emails y contexto de comunicaciones en Gmail.',
    icon: '✉️',
    color: 'bg-red-500',
    category: 'communication',
    features: [
      'Buscar emails por contenido o remitente',
      'Contexto de comunicaciones con clientes',
      'Resúmenes automáticos de hilos',
    ],
    scopes: ['gmail.readonly'],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Consulta tu calendario, reuniones y contexto de eventos.',
    icon: '📅',
    color: 'bg-blue-500',
    category: 'productivity',
    features: [
      'Consultar agenda y próximas reuniones',
      'Contexto de participantes y notas',
      'Preparar briefings pre-reunión',
    ],
    scopes: ['calendar.readonly', 'calendar.events.readonly'],
  },
]

// OAuth URLs (will be Supabase Edge Functions)
export const getOAuthUrl = (integrationId: IntegrationId, tenantId: string): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  return `${baseUrl}/functions/v1/oauth/${integrationId}/authorize?tenant_id=${tenantId}`
}

// API helpers
export const getIntegrationDef = (id: IntegrationId): Integration | undefined => {
  return INTEGRATIONS.find(i => i.id === id)
}
