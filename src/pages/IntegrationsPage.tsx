import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { 
  Settings, 
  Slack, 
  Database, 
  FileText, 
  Chrome, 
  CheckCircle, 
  XCircle, 
  Plus,
  Key,
  Link,
  Zap,
  Folder,
  Hash,
  RefreshCw,
  Eye,
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'connected' | 'disconnected' | 'pending' | 'syncing'
  category: 'Knowledge' | 'Communication' | 'CRM' | 'Analytics'
  features: string[]
  isAvailable: boolean
  connectedSources?: string[]
  lastSync?: string
}

interface NotionSpace {
  id: string
  name: string
  type: 'page' | 'database'
  selected: boolean
}

interface SlackChannel {
  id: string
  name: string
  type: 'public' | 'private'
  selected: boolean
}

interface NotionIntegration {
  id: string
  notion_token: string
  database_id: string
  last_sync: string | null
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  documents_synced: number
}

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sincroniza documentos y bases de conocimiento desde Notion',
      icon: FileText,
      status: 'disconnected',
      category: 'Knowledge',
      features: ['OAuth seguro', 'Selector de páginas', 'Sync en tiempo real', 'Embeddings automáticos'],
      isAvailable: true
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Aprende de conversaciones en canales específicos de Slack',
      icon: Slack,
      status: 'disconnected',
      category: 'Communication',
      features: ['Bot nativo', 'Selector de canales', 'Historial seguro', 'Comandos /cerebro'],
      isAvailable: true
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Indexa documentos de carpetas específicas en Drive',
      icon: Chrome,
      status: 'disconnected',
      category: 'Knowledge',
      features: ['OAuth Drive API', 'Selector carpetas', 'Auto-indexación', 'Permisos granulares'],
      isAvailable: true
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Conecta con datos de clientes y casos específicos',
      icon: Database,
      status: 'disconnected',
      category: 'CRM',
      features: ['API nativa', 'Filtros personalizados', 'Datos en tiempo real', 'Scripts inteligentes'],
      isAvailable: false
    }
  ])

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [configStep, setConfigStep] = useState<'auth' | 'sources' | 'confirm'>('auth')
  const [showConfigModal, setShowConfigModal] = useState(false)
  
  // Notion specific states
  const [notionIntegration, setNotionIntegration] = useState<NotionIntegration | null>(null)
  const [notionToken, setNotionToken] = useState('')
  const [databaseId, setDatabaseId] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Mock data for demo
  const [notionSpaces, setNotionSpaces] = useState<NotionSpace[]>([
    { id: '1', name: 'Customer Success Playbook', type: 'page', selected: false },
    { id: '2', name: 'Base de Conocimiento Retorna', type: 'database', selected: false },
    { id: '3', name: 'Procesos Operativos', type: 'page', selected: false },
    { id: '4', name: 'Scripts de Atención', type: 'database', selected: false },
    { id: '5', name: 'Compliance y Regulaciones', type: 'page', selected: false },
  ])

  const [slackChannels, setSlackChannels] = useState<SlackChannel[]>([
    { id: '1', name: 'customer-success', type: 'public', selected: false },
    { id: '2', name: 'general', type: 'public', selected: false },
    { id: '3', name: 'ops-interno', type: 'private', selected: false },
    { id: '4', name: 'escalaciones', type: 'private', selected: false },
    { id: '5', name: 'knowledge-sharing', type: 'public', selected: false },
  ])

  // Load existing Notion integration
  useEffect(() => {
    loadNotionIntegration()
  }, [])

  const loadNotionIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('notion_integrations')
        .select('*')
        .limit(1)
        .single()

      if (data && !error) {
        setNotionIntegration(data)
        setNotionToken(data.notion_token || '')
        setDatabaseId(data.database_id || '')
        
        // Update integrations state
        setIntegrations(prev => prev.map(integration =>
          integration.id === 'notion'
            ? { 
                ...integration, 
                status: data.status === 'connected' ? 'connected' : 'disconnected',
                lastSync: data.last_sync
              }
            : integration
        ))
      }
    } catch (error) {
      console.log('No existing Notion integration found')
    }
  }

  const connectNotion = async () => {
    if (!notionToken.trim() || !databaseId.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa el token de Notion y el ID de la base de datos",
        variant: "destructive"
      })
      return
    }

    setIsConnecting(true)
    try {
      // Test connection first
      const { data: testResult, error: testError } = await supabase.functions.invoke('sync-notion', {
        body: {
          action: 'test',
          notion_token: notionToken,
          database_id: databaseId
        }
      })

      if (testError) {
        throw new Error('Error al conectar con Notion: ' + testError.message)
      }

      // Save integration
      const { data, error } = await supabase
        .from('notion_integrations')
        .upsert({
          notion_token: notionToken,
          database_id: databaseId,
          status: 'connected',
          last_sync: new Date().toISOString(),
          documents_synced: 0
        })
        .select()
        .single()

      if (error) throw error

      setNotionIntegration(data)
      
      // Update integrations state
      setIntegrations(prev => prev.map(integration =>
        integration.id === 'notion'
          ? { ...integration, status: 'connected', lastSync: new Date().toLocaleString() }
          : integration
      ))
      
      setShowConfigModal(false)
      
      toast({
        title: "¡Notion conectado!",
        description: "La integración con Notion se ha configurado correctamente"
      })

    } catch (error: any) {
      console.error('Notion connection error:', error)
      toast({
        title: "Error de conexión",
        description: error.message || "No se pudo conectar con Notion",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const syncNotionDocuments = async () => {
    if (!notionIntegration) return

    setIsSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-notion', {
        body: {
          action: 'sync',
          notion_token: notionIntegration.notion_token,
          database_id: notionIntegration.database_id
        }
      })

      if (error) throw error

      // Update integration status
      const { error: updateError } = await supabase
        .from('notion_integrations')
        .update({
          last_sync: new Date().toISOString(),
          documents_synced: data.documents_processed || 0,
          status: 'connected'
        })
        .eq('id', notionIntegration.id)

      if (updateError) throw updateError

      // Reload integration data
      await loadNotionIntegration()

      toast({
        title: "Sincronización completa",
        description: `Se sincronizaron ${data.documents_processed || 0} documentos desde Notion`
      })

    } catch (error: any) {
      console.error('Notion sync error:', error)
      
      // Update status to error
      if (notionIntegration) {
        await supabase
          .from('notion_integrations')
          .update({ status: 'error' })
          .eq('id', notionIntegration.id)
      }

      toast({
        title: "Error de sincronización",
        description: error.message || "No se pudieron sincronizar los documentos",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const disconnectNotion = async () => {
    if (!notionIntegration) return

    try {
      const { error } = await supabase
        .from('notion_integrations')
        .update({ status: 'disconnected' })
        .eq('id', notionIntegration.id)

      if (error) throw error

      setNotionIntegration(null)
      setNotionToken('')
      setDatabaseId('')
      
      // Update integrations state
      setIntegrations(prev => prev.map(integration =>
        integration.id === 'notion'
          ? { ...integration, status: 'disconnected', lastSync: undefined }
          : integration
      ))

      toast({
        title: "Notion desconectado",
        description: "La integración con Notion ha sido desactivada"
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo desconectar Notion",
        variant: "destructive"
      })
    }
  }

  const handleConnect = (integrationId: string) => {
    if (integrationId === 'notion') {
      // Handle Notion connection differently
      setSelectedIntegration(integrations.find(i => i.id === integrationId) || null)
      setConfigStep('auth')
      setShowConfigModal(true)
    } else {
      // Handle other integrations
      setSelectedIntegration(integrations.find(i => i.id === integrationId) || null)
      setConfigStep('auth')
      setShowConfigModal(true)
    }
  }

  const handleAuthComplete = () => {
    if (selectedIntegration?.id === 'notion') {
      // For Notion, directly connect instead of going to sources
      connectNotion()
    } else {
      setConfigStep('sources')
    }
  }

  const handleSourcesComplete = () => {
    setConfigStep('confirm')
  }

  const handleFinalConnect = () => {
    if (!selectedIntegration) return

    // Get selected sources
    let selectedSources: string[] = []
    if (selectedIntegration.id === 'slack') {
      selectedSources = slackChannels.filter(c => c.selected).map(c => `#${c.name}`)
    }

    // Update integration status
    setIntegrations(prev => prev.map(i => 
      i.id === selectedIntegration.id 
        ? { 
            ...i, 
            status: 'syncing', 
            connectedSources: selectedSources,
            lastSync: new Date().toLocaleString()
          } 
        : i
    ))

    // Simulate sync completion after 3 seconds
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id 
          ? { ...i, status: 'connected' }
          : i
      ))
    }, 3000)

    setShowConfigModal(false)
    setSelectedIntegration(null)
    setConfigStep('auth')
  }

  const handleDisconnect = (integrationId: string) => {
    if (integrationId === 'notion') {
      disconnectNotion()
    } else {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, status: 'disconnected', connectedSources: undefined, lastSync: undefined }
          : integration
      ))
    }
  }

  const toggleNotionSpace = (spaceId: string) => {
    setNotionSpaces(prev => prev.map(space => 
      space.id === spaceId ? { ...space, selected: !space.selected } : space
    ))
  }

  const toggleSlackChannel = (channelId: string) => {
    setSlackChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, selected: !channel.selected } : channel
    ))
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'syncing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'pending': return <Zap className="w-4 h-4 text-yellow-600" />
      case 'disconnected': return <XCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const categories = ['Knowledge', 'Communication', 'CRM', 'Analytics'] as const

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
            <p className="text-gray-600">Conecta Cerebro con tus herramientas y elige qué información usar</p>
          </div>
          
          <Badge variant="outline" className="text-xs">
            🔒 Solo Administradores
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Conectadas</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <RefreshCw className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Sincronizando</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'syncing').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.isAvailable).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Fuentes Activas</p>
                  <p className="text-2xl font-bold">
                    {integrations.reduce((total, i) => total + (i.connectedSources?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations by Category */}
        {categories.map(category => {
          const categoryIntegrations = integrations.filter(i => i.category === category)
          if (categoryIntegrations.length === 0) return null

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryIntegrations.map((integration) => {
                  const IconComponent = integration.icon
                  return (
                    <Card key={integration.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                {getStatusIcon(integration.status)}
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getStatusColor(integration.status)}`}
                                >
                                  {integration.status === 'connected' ? 'Conectado' : 
                                   integration.status === 'syncing' ? 'Sincronizando' :
                                   integration.status === 'pending' ? 'Pendiente' : 'Desconectado'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                        
                        {/* Connected Sources */}
                        {integration.connectedSources && integration.connectedSources.length > 0 && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-xs font-semibold text-green-700 mb-2">
                              🟢 Fuentes Conectadas ({integration.connectedSources.length})
                            </p>
                            <div className="space-y-1">
                              {integration.connectedSources.slice(0, 2).map((source, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Folder className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-green-700">{source}</span>
                                </div>
                              ))}
                              {integration.connectedSources.length > 2 && (
                                <p className="text-xs text-green-600">
                                  +{integration.connectedSources.length - 2} más...
                                </p>
                              )}
                            </div>
                            {integration.lastSync && (
                              <p className="text-xs text-green-600 mt-2">
                                Última sync: {integration.lastSync}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Special Notion Integration Status */}
                        {integration.id === 'notion' && notionIntegration && integration.status === 'connected' && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-xs font-semibold text-green-700 mb-2">
                              🟢 Notion Conectado
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Database className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-700">Base de datos configurada</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-700">
                                  {notionIntegration.documents_synced} documentos sincronizados
                                </span>
                              </div>
                            </div>
                            {notionIntegration.last_sync && (
                              <p className="text-xs text-green-600 mt-2">
                                Última sync: {new Date(notionIntegration.last_sync).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Características</p>
                          {integration.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          {integration.isAvailable ? (
                            integration.status === 'disconnected' ? (
                              <Button 
                                onClick={() => handleConnect(integration.id)}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                size="sm"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Conectar
                              </Button>
                            ) : integration.status === 'connected' ? (
                              <>
                                {integration.id === 'notion' ? (
                                  <>
                                    <Button 
                                      onClick={syncNotionDocuments}
                                      disabled={isSyncing}
                                      variant="outline" 
                                      className="flex-1"
                                      size="sm"
                                    >
                                      {isSyncing ? (
                                        <>
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          Sincronizando...
                                        </>
                                      ) : (
                                        <>
                                          <RefreshCw className="w-4 h-4 mr-2" />
                                          Sincronizar
                                        </>
                                      )}
                                    </Button>
                                    <Button 
                                      onClick={() => handleDisconnect(integration.id)}
                                      variant="outline" 
                                      className="text-red-600 hover:text-red-700"
                                      size="sm"
                                      disabled={isSyncing}
                                    >
                                      Desconectar
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button 
                                      onClick={() => handleConnect(integration.id)}
                                      variant="outline" 
                                      className="flex-1"
                                      size="sm"
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Configurar
                                    </Button>
                                    <Button 
                                      onClick={() => handleDisconnect(integration.id)}
                                      variant="outline" 
                                      className="text-red-600 hover:text-red-700"
                                      size="sm"
                                    >
                                      Desconectar
                                    </Button>
                                  </>
                                )}
                              </>
                            ) : (
                              <Button disabled className="flex-1" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                {integration.status === 'syncing' ? 'Sincronizando...' : 'Conectando...'}
                              </Button>
                            )
                          ) : (
                            <Button disabled className="flex-1" size="sm">
                              Próximamente
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Smart Configuration Modal */}
        {showConfigModal && selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-[600px] max-w-90vw max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <selectedIntegration.icon className="w-6 h-6" />
                  <span>Configurar {selectedIntegration.name}</span>
                  <Badge variant="outline">
                    {selectedIntegration.id === 'notion' ? '1/1' : configStep === 'auth' ? '1/3' : configStep === 'sources' ? '2/3' : '3/3'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Step 1: Authentication */}
                {configStep === 'auth' && (
                  <div className="space-y-4">
                    {selectedIntegration.id === 'notion' ? (
                      // Special Notion configuration
                      <div className="space-y-4">
                        <div className="text-center p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                          <FileText className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Conectar con Notion
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Configura tu integración con Notion para sincronizar documentos automáticamente
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Token de Integración de Notion</label>
                          <Input
                            type="password"
                            placeholder="secret_xxxxxxxxxxxxxx"
                            value={notionToken}
                            onChange={(e) => setNotionToken(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            <a href="https://developers.notion.com/docs/getting-started" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              ¿Cómo obtener un token de Notion? <ExternalLink className="inline w-3 h-3" />
                            </a>
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">ID de Base de Datos</label>
                          <Input
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            value={databaseId}
                            onChange={(e) => setDatabaseId(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            ID de la base de datos de Notion que contiene los documentos
                          </p>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Seguro:</strong> Cerebro solo tendrá acceso de lectura a la base de datos especificada.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={handleAuthComplete}
                            disabled={isConnecting || !notionToken.trim() || !databaseId.trim()}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Conectando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Conectar Notion
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowConfigModal(false)
                              setSelectedIntegration(null)
                              setConfigStep('auth')
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Standard OAuth flow for other integrations
                      <div className="space-y-4">
                        <div className="text-center p-6 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                          <selectedIntegration.icon className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                          <h3 className="font-semibold text-gray-900 mb-2">
                            Conectar con {selectedIntegration.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Se abrirá una ventana para autorizar el acceso seguro a tu workspace de {selectedIntegration.name}
                          </p>
                          <Button 
                            onClick={handleAuthComplete}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Autorizar Acceso OAuth
                          </Button>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Seguro:</strong> Cerebro solo tendrá acceso de lectura a las fuentes que selecciones en el siguiente paso.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Source Selection (only for non-Notion integrations) */}
                {configStep === 'sources' && selectedIntegration.id !== 'notion' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Selecciona las fuentes que Cerebro debe usar
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {selectedIntegration.id === 'slack' 
                          ? 'Elige qué canales de Slack quieres que Cerebro monitoree:'
                          : 'Elige las fuentes de datos que deseas sincronizar:'
                        }
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {selectedIntegration.id === 'slack' && slackChannels.map(channel => (
                        <div key={channel.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input 
                            type="checkbox" 
                            checked={channel.selected}
                            onChange={() => toggleSlackChannel(channel.id)}
                            className="w-4 h-4 text-purple-600"
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">#{channel.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {channel.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSourcesComplete}
                        disabled={
                          selectedIntegration.id === 'slack' 
                            ? !slackChannels.some(c => c.selected)
                            : false
                        }
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" onClick={() => setConfigStep('auth')}>
                        Atrás
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {configStep === 'confirm' && (
                  <div className="space-y-4">
                    <div className="text-center p-6 border-2 border-green-200 rounded-lg bg-green-50">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">
                        ¡Todo listo para conectar!
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Cerebro empezará a sincronizar y aprender de las fuentes seleccionadas
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Fuentes seleccionadas:</h4>
                      <div className="space-y-1">
                        {selectedIntegration.id === 'slack' && 
                          slackChannels.filter(c => c.selected).map(channel => (
                            <div key={channel.id} className="flex items-center space-x-2">
                              <Eye className="w-3 h-3 text-green-600" />
                              <span className="text-sm">#{channel.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleFinalConnect}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Activar Integración
                      </Button>
                      <Button variant="outline" onClick={() => setConfigStep('sources')}>
                        Atrás
                      </Button>
                    </div>
                  </div>
                )}

                {configStep !== 'confirm' && selectedIntegration.id !== 'notion' && (
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowConfigModal(false)
                        setSelectedIntegration(null)
                        setConfigStep('auth')
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntegrationsPage