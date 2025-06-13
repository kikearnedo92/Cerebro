
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, FileText, MessageSquare, FolderOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import NotionIntegration from '@/components/integrations/NotionIntegration'

const IntegrationsPage = () => {
  const [notionStatus, setNotionStatus] = useState<'connected' | 'disconnected' | 'pending'>('disconnected')
  
  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      description: 'Integra Cerebro como bot en canales de Slack',
      status: 'pending',
      lastSync: null,
      documentsCount: 0
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      icon: FolderOpen,
      description: 'Importa documentos desde Google Drive automáticamente',
      status: 'disconnected',
      lastSync: null,
      documentsCount: 0
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800">Desconectado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getActionButton = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Configurar</Button>
            <Button variant="outline" size="sm">Sincronizar</Button>
          </div>
        )
      case 'pending':
        return <Button variant="outline" size="sm">Completar Setup</Button>
      case 'disconnected':
        return <Button size="sm">Conectar</Button>
      default:
        return <Button variant="outline" size="sm">Configurar</Button>
    }
  }

  // Calcular estadísticas incluyendo Notion
  const connectedCount = integrations.filter(i => i.status === 'connected').length + 
                         (notionStatus === 'connected' ? 1 : 0)
  
  const totalDocuments = integrations.reduce((sum, i) => sum + i.documentsCount, 0)

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Integraciones
          </h1>
          <p className="text-gray-600">Conecta Cerebro con tus herramientas favoritas</p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Explorar Integraciones
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-lg font-bold">{connectedCount}</p>
                <p className="text-sm text-gray-600">Integraciones Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{totalDocuments}</p>
                <p className="text-sm text-gray-600">Documentos Sincronizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-lg font-bold">Ahora</p>
                <p className="text-sm text-gray-600">Última Sincronización</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Integraciones Disponibles</h2>
        
        {/* Notion Integration - Componente especial */}
        <NotionIntegration onStatusChange={setNotionStatus} />
        
        {/* Otras integraciones */}
        {integrations.map((integration) => {
          const IconComponent = integration.icon
          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(integration.status)}
                    {getStatusBadge(integration.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{integration.documentsCount} documentos</span>
                    </div>
                    {integration.lastSync && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Última sync: hace {integration.lastSync}</span>
                      </div>
                    )}
                  </div>
                  {getActionButton(integration.status)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Más Integraciones Próximamente</h3>
          <p className="text-gray-600 mb-4">
            Estamos trabajando en integrar más herramientas como Microsoft Teams, Confluence, Jira y más.
          </p>
          <Button variant="outline" className="flex items-center gap-2 mx-auto">
            <MessageSquare className="w-4 h-4" />
            Solicitar Integración
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntegrationsPage
