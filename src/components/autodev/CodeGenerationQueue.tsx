
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CodeGeneration } from '@/types/autodev'
import { Code, Play, RotateCcw, ExternalLink, TestTube, GitBranch, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface CodeGenerationQueueProps {
  data: CodeGeneration[]
  onTriggerGeneration: (title: string, description: string, targetComponent: string, priority: 'low' | 'medium' | 'high' | 'critical') => void
  onRetryGeneration: (id: string) => void
}

export const CodeGenerationQueue: React.FC<CodeGenerationQueueProps> = ({ 
  data, 
  onTriggerGeneration,
  onRetryGeneration 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetComponent: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'deployed': return CheckCircle
      case 'generating': return Clock
      case 'pending': return AlertTriangle
      case 'failed': return XCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'deployed': return 'text-blue-600'
      case 'generating': return 'text-yellow-600'
      case 'pending': return 'text-orange-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'deployed': return 'secondary'
      case 'generating': return 'outline'
      case 'pending': return 'outline'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-blue-600 bg-blue-50'
      case 'low': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.targetComponent) {
      onTriggerGeneration(formData.title, formData.description, formData.targetComponent, formData.priority)
      setFormData({ title: '', description: '', targetComponent: '', priority: 'medium' })
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header con botón de nueva generación */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cola de Generación de Código</h3>
          <p className="text-sm text-gray-600">Tareas de generación automática de código en progreso y completadas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Play className="h-4 w-4 mr-2" />
              Nueva Generación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Generación de Código</DialogTitle>
              <DialogDescription>
                Inicia una nueva tarea de generación automática de código usando Claude y Lovable API
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Optimización del formulario de registro"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe la mejora que quieres implementar..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Componente objetivo</label>
                <Input
                  value={formData.targetComponent}
                  onChange={(e) => setFormData({ ...formData, targetComponent: e.target.value })}
                  placeholder="Ej: RegisterForm.tsx"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prioridad</label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Iniciar Generación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de generaciones */}
      <div className="space-y-4">
        {data.map((generation) => {
          const StatusIcon = getStatusIcon(generation.status)
          
          return (
            <Card key={generation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(generation.status)}`} />
                      <CardTitle className="text-lg">{generation.title}</CardTitle>
                      <Badge variant={getBadgeVariant(generation.status)}>
                        {generation.status}
                      </Badge>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(generation.priority)}`}>
                        {generation.priority}
                      </div>
                    </div>
                    <CardDescription>{generation.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Información del proceso */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Componente:</span>
                      <div className="font-medium flex items-center">
                        <Code className="h-3 w-3 mr-1" />
                        {generation.target_component}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Análisis:</span>
                      <div className="font-medium">{generation.spec_generated_by}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Generación:</span>
                      <div className="font-medium">{generation.code_generated_by}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Origen:</span>
                      <div className="font-medium capitalize">{generation.trigger_source}</div>
                    </div>
                  </div>

                  {/* Impacto estimado */}
                  {generation.estimated_impact && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <span className="text-sm font-medium">Impacto estimado:</span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-1 text-sm">
                        {generation.estimated_impact.conversion_lift && (
                          <div>Conversión: <strong>+{(generation.estimated_impact.conversion_lift * 100).toFixed(1)}%</strong></div>
                        )}
                        {generation.estimated_impact.retention_improvement && (
                          <div>Retención: <strong>+{(generation.estimated_impact.retention_improvement * 100).toFixed(1)}%</strong></div>
                        )}
                        {generation.estimated_impact.performance_gain && (
                          <div>Performance: <strong>+{(generation.estimated_impact.performance_gain * 100).toFixed(1)}%</strong></div>
                        )}
                        {generation.estimated_impact.cost_reduction && (
                          <div>Costos: <strong>-{(generation.estimated_impact.cost_reduction * 100).toFixed(1)}%</strong></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Testing results */}
                  {generation.test_results && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center">
                          <TestTube className="h-4 w-4 mr-1" />
                          Resultados de Testing
                        </span>
                        <span className="text-sm">{generation.test_results.coverage}% cobertura</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600">✓ {generation.test_results.passed} pasaron</span>
                        <span className="text-red-600">✗ {generation.test_results.failed} fallaron</span>
                        <Progress value={generation.test_results.coverage} className="flex-1 max-w-32" />
                      </div>
                    </div>
                  )}

                  {/* Performance metrics */}
                  {generation.performance_metrics && (
                    <div className="bg-purple-50 p-3 rounded-md">
                      <span className="text-sm font-medium">Métricas de Performance:</span>
                      <div className="grid grid-cols-2 gap-4 mt-1 text-sm">
                        <div>
                          <span className="text-gray-600">Antes:</span>
                          <div>Conversión: {(generation.performance_metrics.before.conversion_rate * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Después:</span>
                          <div>Conversión: {(generation.performance_metrics.after.conversion_rate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Creado: {new Date(generation.created_at).toLocaleDateString()}
                      {generation.deployed_at && (
                        <span> • Desplegado: {new Date(generation.deployed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {generation.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onRetryGeneration(generation.id)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reintentar
                        </Button>
                      )}
                      
                      {generation.pull_request_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={generation.pull_request_url} target="_blank" rel="noopener noreferrer">
                            <GitBranch className="h-3 w-3 mr-1" />
                            Ver PR
                          </a>
                        </Button>
                      )}
                      
                      {generation.deployment_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={generation.deployment_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Ver Deploy
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
