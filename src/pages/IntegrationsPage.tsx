
import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Puzzle, Settings, Database } from 'lucide-react'
import { Navigate } from 'react-router-dom'

const IntegrationsPage = () => {
  const { isAdmin, isSuperAdmin, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!authLoading && !isAdmin && !isSuperAdmin) {
    return <Navigate to="/chat" replace />
  }

  // Solo integraciones reales que están implementadas
  const integrations = [
    {
      id: 'notion',
      name: 'Notion',
      description: 'Conecta tu workspace de Notion para importar documentos automáticamente',
      icon: Database,
      status: 'available',
      category: 'Productividad'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-600">Conectado</Badge>
      case 'available':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Disponible</Badge>
      default:
        return <Badge variant="secondary">No disponible</Badge>
    }
  }

  const getIntegrationIcon = (integration: any) => {
    const Icon = integration.icon
    return <Icon className="w-8 h-8 text-black" />
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integraciones</h1>
          <p className="text-gray-600">Conecta Cerebro con tus herramientas favoritas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Puzzle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Integraciones</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-600" />
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
              <Settings className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'available').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIntegrationIcon(integration)}
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>

              <div className="flex gap-2 pt-2">
                {integration.status === 'available' ? (
                  <Button className="flex-1">
                    Conectar
                  </Button>
                ) : integration.status === 'connected' ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" disabled className="flex-1">
                    No disponible
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas ayuda?</CardTitle>
          <CardDescription>
            Aprende cómo configurar y usar las integraciones de Cerebro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Documentación</h4>
              <p className="text-sm text-gray-600 mb-3">
                Guías paso a paso para configurar cada integración
              </p>
              <Button variant="outline" size="sm">Ver Docs</Button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Soporte</h4>
              <p className="text-sm text-gray-600 mb-3">
                ¿Tienes problemas? Contacta a nuestro equipo de soporte
              </p>
              <Button variant="outline" size="sm">Contactar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntegrationsPage
