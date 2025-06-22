
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Settings,
  TrendingUp
} from 'lucide-react'
import { AutomationPipeline } from '@/types/autodev'

interface AutomationPipelinesProps {
  data: AutomationPipeline[]
  onTogglePipeline: (pipelineId: string, status: 'active' | 'paused' | 'disabled') => void
}

export const AutomationPipelines: React.FC<AutomationPipelinesProps> = ({ 
  data, 
  onTogglePipeline 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />
      case 'disabled':
        return <Square className="h-4 w-4 text-gray-400" />
      default:
        return <Settings className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disabled':
        return 'bg-gray-100 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipelines de Automatización</h2>
          <p className="text-gray-600">Flujos de trabajo automatizados para mejora continua</p>
        </div>
      </div>

      <div className="grid gap-6">
        {data.map((pipeline) => (
          <Card key={pipeline.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(pipeline.status)}
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    <Badge className={`${getStatusColor(pipeline.status)} text-xs px-2 py-1`}>
                      {pipeline.status === 'active' ? 'Activo' : 
                       pipeline.status === 'paused' ? 'Pausado' : 'Deshabilitado'}
                    </Badge>
                  </div>
                  <CardDescription>{pipeline.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {pipeline.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTogglePipeline(pipeline.id, 'paused')}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pausar
                    </Button>
                  ) : pipeline.status === 'paused' ? (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onTogglePipeline(pipeline.id, 'active')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Activar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTogglePipeline(pipeline.id, 'disabled')}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Deshabilitar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onTogglePipeline(pipeline.id, 'active')}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Habilitar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Métricas del Pipeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{pipeline.success_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Tasa de Éxito</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{pipeline.total_executions}</div>
                  <div className="text-sm text-gray-500">Ejecuciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{pipeline.steps.length}</div>
                  <div className="text-sm text-gray-500">Pasos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-lg font-semibold text-gray-900">Optimizado</span>
                  </div>
                  <div className="text-sm text-gray-500">Estado</div>
                </div>
              </div>

              {/* Pasos del Pipeline */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pasos del Pipeline</h4>
                <div className="space-y-3">
                  {pipeline.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-200">
                        <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStepStatusIcon(step.status)}
                          <span className="font-medium text-gray-900">{step.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.service}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Tipo: {step.type}</span>
                          {step.duration && (
                            <span>Duración: {step.duration}s</span>
                          )}
                          {step.error_message && (
                            <span className="text-red-600">Error: {step.error_message}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condiciones de Activación */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Condiciones de Activación</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Umbral de Insight:</span>
                    <span className="ml-2 font-medium">{pipeline.trigger_conditions.insight_threshold}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="ml-2 font-medium">{pipeline.trigger_conditions.frequency_threshold}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Prioridad:</span>
                    <span className="ml-2 font-medium">{pipeline.trigger_conditions.priority_threshold}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Auto-ejecución:</span>
                    <Badge variant={pipeline.trigger_conditions.auto_execute ? "default" : "secondary"} className="ml-2">
                      {pipeline.trigger_conditions.auto_execute ? 'Habilitada' : 'Manual'}
                    </Badge>
                  </div>
                </div>
              </div>

              {pipeline.last_execution && (
                <div className="mt-4 text-sm text-gray-500">
                  Última ejecución: {new Date(pipeline.last_execution).toLocaleString('es-ES')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
