
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, Settings, Play, Pause, Trash2, Copy } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'delay'
  title: string
  description: string
  config: Record<string, any>
}

interface GeneratedWorkflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  status: 'draft' | 'active' | 'paused'
  createdAt: Date
  lastRun?: Date
  executions: number
}

export const N8nAIWorkflowBuilder = () => {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [workflows, setWorkflows] = useState<GeneratedWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<GeneratedWorkflow | null>(null)

  const generateWorkflow = async () => {
    if (!description.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Describe la automatización que necesitas",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log('🤖 Generating workflow with AI:', description)

      const { data, error } = await supabase.functions.invoke('generate-n8n-workflow', {
        body: { description }
      })

      if (error) throw error

      const newWorkflow: GeneratedWorkflow = {
        ...data.workflow,
        id: `workflow_${Date.now()}`,
        createdAt: new Date(),
        executions: 0,
        status: 'draft'
      }

      setWorkflows(prev => [...prev, newWorkflow])
      setSelectedWorkflow(newWorkflow)
      setDescription('')

      toast({
        title: "¡Workflow generado!",
        description: "Revisa la automatización y actívala cuando esté lista"
      })

    } catch (error) {
      console.error('❌ Workflow generation failed:', error)
      toast({
        title: "Error generando workflow",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const deployWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase.functions.invoke('deploy-n8n-workflow', {
        body: { workflowId }
      })

      if (error) throw error

      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'active' as const }
          : w
      ))

      toast({
        title: "Workflow activado",
        description: "La automatización está ahora ejecutándose"
      })

    } catch (error) {
      console.error('❌ Workflow deployment failed:', error)
      toast({
        title: "Error activando workflow",
        description: "No se pudo activar la automatización",
        variant: "destructive"
      })
    }
  }

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { 
            ...w, 
            status: w.status === 'active' ? 'paused' : 'active'
          }
        : w
    ))

    const workflow = workflows.find(w => w.id === workflowId)
    const newStatus = workflow?.status === 'active' ? 'pausado' : 'activado'
    
    toast({
      title: `Workflow ${newStatus}`,
      description: `La automatización ha sido ${newStatus}`
    })
  }

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId))
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null)
    }
    
    toast({
      title: "Workflow eliminado",
      description: "La automatización ha sido eliminada"
    })
  }

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger':
        return '🎯'
      case 'condition':
        return '❓'
      case 'action':
        return '⚡'
      case 'delay':
        return '⏱️'
      default:
        return '📋'
    }
  }

  const examplePrompts = [
    "Cuando un usuario abandone el carrito por más de 24 horas, enviar email de recordatorio",
    "Si un usuario no abre la app por 7 días, enviar notificación push personalizada",
    "Cuando el NPS sea menor a 7, crear ticket en Slack y agendar llamada de CS",
    "Si la conversión de landing page baja del 3%, enviar alerta a marketing",
    "Cuando usuario complete onboarding, enviar serie de emails de bienvenida"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            N8N AI Workflow Builder
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Natural Language → Automation
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Describe en lenguaje natural la automatización que necesitas. La IA generará el workflow completo.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{workflows.length}</div>
              <div className="text-sm text-gray-600">Workflows Creados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{workflows.filter(w => w.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{workflows.reduce((acc, w) => acc + w.executions, 0)}</div>
              <div className="text-sm text-gray-600">Ejecuciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{workflows.filter(w => w.status === 'draft').length}</div>
              <div className="text-sm text-gray-600">Borradores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generar Workflow con IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe la automatización que necesitas:
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ejemplo: Cuando el usuario no complete el checkout en 30 minutos, enviar email con descuento del 10%"
                rows={4}
                disabled={isGenerating}
              />
            </div>

            <Button 
              onClick={generateWorkflow}
              disabled={!description.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Generando workflow...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generar Automatización
                </>
              )}
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ejemplos de automatizaciones:</label>
              <div className="space-y-1">
                {examplePrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setDescription(prompt)}
                    className="text-left text-xs text-blue-600 hover:text-blue-800 block hover:underline"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workflows Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay workflows generados</p>
                  <p className="text-xs">Describe una automatización para empezar</p>
                </div>
              ) : (
                workflows.map(workflow => (
                  <div 
                    key={workflow.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedWorkflow?.id === workflow.id ? 'border-purple-300 bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium">{workflow.name}</h4>
                        <p className="text-xs text-gray-600">{workflow.description}</p>
                      </div>
                      <Badge 
                        variant={workflow.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {workflow.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {workflow.nodes.length} pasos • {workflow.executions} ejecuciones
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWorkflow(workflow.id)
                          }}
                          className="h-6 px-2"
                        >
                          {workflow.status === 'active' ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteWorkflow(workflow.id)
                          }}
                          className="h-6 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Detail */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedWorkflow.name}</span>
              <div className="flex gap-2">
                {selectedWorkflow.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => deployWorkflow(selectedWorkflow.id)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Activar
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="w-4 h-4 mr-1" />
                  Duplicar
                </Button>
              </div>
            </CardTitle>
            <p className="text-gray-600">{selectedWorkflow.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium">Flujo de Automatización:</h4>
              <div className="space-y-3">
                {selectedWorkflow.nodes.map((node, index) => (
                  <div key={node.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{node.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {node.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{node.description}</p>
                    </div>
                    {index < selectedWorkflow.nodes.length - 1 && (
                      <div className="flex-shrink-0 text-gray-400">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
