
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Key, 
  Activity,
  BarChart3,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { APIIntegration } from '@/types/autodev'

interface APIIntegrationsProps {
  data: APIIntegration[]
}

export const APIIntegrations: React.FC<APIIntegrationsProps> = ({ data }) => {
  const [editingApi, setEditingApi] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'disconnected':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Settings className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getApiDescription = (type: string) => {
    switch (type) {
      case 'claude':
        return 'IA para análisis y generación de especificaciones'
      case 'lovable':
        return 'Generación automática de código React/TypeScript'
      case 'manus':
        return 'Automatización avanzada y optimizaciones'
      case 'github':
        return 'Control de versiones y despliegue automatizado'
      case 'vercel':
        return 'Hosting y despliegue continuo'
      default:
        return 'Integración API externa'
    }
  }

  const handleTestConnection = (apiId: string) => {
    console.log('Testing connection for API:', apiId)
    // TODO: Implementar test de conexión real
  }

  const handleSaveConfig = (apiId: string) => {
    console.log('Saving config for API:', apiId)
    setEditingApi(null)
    // TODO: Implementar guardado de configuración
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración de APIs</h2>
          <p className="text-gray-600">Gestiona las conexiones con servicios externos</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar Todo
        </Button>
      </div>

      {/* Resumen de Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Estado General de Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(api => api.status === 'connected').length}
              </div>
              <div className="text-sm text-gray-500">Conectadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.filter(api => api.status === 'error').length}
              </div>
              <div className="text-sm text-gray-500">Con Errores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, api) => sum + api.usage_count, 0)}
              </div>
              <div className="text-sm text-gray-500">Usos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(data.reduce((sum, api) => sum + api.success_rate, 0) / data.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Éxito Promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de APIs */}
      <div className="grid gap-6">
        {data.map((api) => (
          <Card key={api.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(api.status)}
                  <div>
                    <CardTitle className="text-lg">{api.name}</CardTitle>
                    <CardDescription>{getApiDescription(api.type)}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(api.status)} text-xs px-2 py-1`}>
                    {api.status === 'connected' ? 'Conectada' : 
                     api.status === 'error' ? 'Error' : 'Desconectada'}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(api.id)}
                  >
                    <Activity className="h-4 w-4 mr-1" />
                    Probar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingApi(editingApi === api.id ? null : api.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Métricas de Uso */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{api.usage_count}</div>
                  <div className="text-sm text-gray-500">Usos</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{api.error_count}</div>
                  <div className="text-sm text-gray-500">Errores</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{api.success_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Éxito</div>
                </div>
              </div>

              {/* Configuración (modo edición) */}
              {editingApi === api.id && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    Configuración de {api.name}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`api-key-${api.id}`}>API Key</Label>
                      <Input
                        id={`api-key-${api.id}`}
                        type="password"
                        placeholder="••••••••••••••••"
                        className="mt-1"
                      />
                    </div>

                    {/* Configuraciones específicas por tipo de API */}
                    {api.type === 'claude' && (
                      <>
                        <div>
                          <Label htmlFor={`model-${api.id}`}>Modelo</Label>
                          <Input
                            id={`model-${api.id}`}
                            defaultValue={api.config.model || 'claude-3-opus-20240229'}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`max-tokens-${api.id}`}>Max Tokens</Label>
                          <Input
                            id={`max-tokens-${api.id}`}
                            type="number"
                            defaultValue={api.config.max_tokens || 4000}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}

                    {api.type === 'github' && (
                      <>
                        <div>
                          <Label htmlFor={`repo-${api.id}`}>Repositorio</Label>
                          <Input
                            id={`repo-${api.id}`}
                            defaultValue={api.config.repository || ''}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`branch-${api.id}`}>Branch</Label>
                          <Input
                            id={`branch-${api.id}`}
                            defaultValue={api.config.branch || 'main'}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" onClick={() => handleSaveConfig(api.id)}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingApi(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {api.last_used && (
                  <div>
                    Último uso: {new Date(api.last_used).toLocaleString('es-ES')}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <span>Tipo: {api.type}</span>
                  <span>•</span>
                  <span>Configurada: {Object.keys(api.config).length} parámetros</span>
                  {api.type === 'github' && api.config.repository && (
                    <>
                      <span>•</span>
                      <a 
                        href={`https://github.com/${api.config.repository}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        Ver repo <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
