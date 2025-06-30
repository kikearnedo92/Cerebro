
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Bot, Code, CheckCircle, Clock, AlertCircle, Send, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface DevelopmentTask {
  id: string
  title: string
  description: string
  status: 'analyzing' | 'generating' | 'reviewing' | 'deploying' | 'completed' | 'approved' | 'rejected'
  progress: number
  claudeSpec?: string
  lovableCode?: string
  previewUrl?: string
  createdAt: Date
  completedAt?: Date
}

export const ClaudeLovableIntegration = () => {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tasks, setTasks] = useState<DevelopmentTask[]>([])
  const [activeTask, setActiveTask] = useState<DevelopmentTask | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [tasks])

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return

    const userMessage = message.trim()
    setMessage('')
    setIsProcessing(true)

    try {
      console.log('🚀 Sending development request to Claude:', userMessage)

      // Create new task
      const newTask: DevelopmentTask = {
        id: `task_${Date.now()}`,
        title: userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage,
        description: userMessage,
        status: 'analyzing',
        progress: 10,
        createdAt: new Date()
      }

      setTasks(prev => [...prev, newTask])
      setActiveTask(newTask)

      // Step 1: Claude Analysis
      const { data: claudeData, error: claudeError } = await supabase.functions.invoke('claude-analyze-request', {
        body: { request: userMessage }
      })

      if (claudeError) throw claudeError

      // Update task with Claude's analysis
      const updatedTask = {
        ...newTask,
        status: 'generating' as const,
        progress: 40,
        claudeSpec: claudeData.specification
      }

      setTasks(prev => prev.map(t => t.id === newTask.id ? updatedTask : t))
      setActiveTask(updatedTask)

      toast({
        title: "Claude completó el análisis",
        description: "Generando código con Lovable..."
      })

      // Step 2: Lovable Code Generation
      const { data: lovableData, error: lovableError } = await supabase.functions.invoke('lovable-generate-code', {
        body: { 
          specification: claudeData.specification,
          taskId: newTask.id
        }
      })

      if (lovableError) throw lovableError

      // Update task with Lovable's code
      const finalTask = {
        ...updatedTask,
        status: 'reviewing' as const,
        progress: 80,
        lovableCode: lovableData.code,
        previewUrl: lovableData.previewUrl
      }

      setTasks(prev => prev.map(t => t.id === newTask.id ? finalTask : t))
      setActiveTask(finalTask)

      toast({
        title: "Código generado exitosamente",
        description: "Revisión disponible para aprobación"
      })

    } catch (error) {
      console.error('❌ Development request failed:', error)
      
      // Update task as failed
      setTasks(prev => prev.map(t => 
        t.id === activeTask?.id 
          ? { ...t, status: 'rejected' as const, progress: 0 }
          : t
      ))

      toast({
        title: "Error en el desarrollo",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const approveTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'deploying' as const, progress: 95 }
          : t
      ))

      // Deploy to production
      const { error } = await supabase.functions.invoke('deploy-approved-changes', {
        body: { 
          taskId,
          code: task.lovableCode,
          specification: task.claudeSpec
        }
      })

      if (error) throw error

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              status: 'completed' as const, 
              progress: 100,
              completedAt: new Date()
            }
          : t
      ))

      toast({
        title: "¡Deploy exitoso!",
        description: "Los cambios están ahora en producción"
      })

    } catch (error) {
      console.error('❌ Deploy failed:', error)
      toast({
        title: "Error en deploy",
        description: "No se pudieron aplicar los cambios",
        variant: "destructive"
      })
    }
  }

  const rejectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'rejected' as const }
        : t
    ))

    toast({
      title: "Cambios rechazados",
      description: "La tarea ha sido marcada como rechazada"
    })
  }

  const getStatusIcon = (status: DevelopmentTask['status']) => {
    switch (status) {
      case 'analyzing':
        return <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'generating':
        return <Code className="w-4 h-4 text-purple-500 animate-pulse" />
      case 'reviewing':
        return <Eye className="w-4 h-4 text-orange-500" />
      case 'deploying':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DevelopmentTask['status']) => {
    switch (status) {
      case 'analyzing':
        return 'bg-blue-100 text-blue-700'
      case 'generating':
        return 'bg-purple-100 text-purple-700'
      case 'reviewing':
        return 'bg-orange-100 text-orange-700'
      case 'deploying':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" />
              <span>Claude</span>
            </div>
            <div className="text-gray-400">⚡</div>
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-600" />
              <span>Lovable</span>
            </div>
            <Badge variant="outline" className="ml-auto">
              Integration Active
            </Badge>
          </CardTitle>
          <p className="text-gray-600">
            Describe qué necesitas desarrollar. Claude analiza y Lovable ejecuta automáticamente.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'analyzing' || t.status === 'generating').length}</div>
              <div className="text-sm text-gray-600">En Desarrollo</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{tasks.filter(t => t.status === 'reviewing').length}</div>
              <div className="text-sm text-gray-600">Para Revisión</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'rejected').length}</div>
              <div className="text-sm text-gray-600">Rechazadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nueva Solicitud de Desarrollo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ejemplo: 'Necesito optimizar el checkout para reducir abandono', 'Agregar sistema de notificaciones push', 'Mejorar la velocidad de carga de imágenes'..."
                rows={4}
                disabled={isProcessing}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-pulse" />
                    Procesando con Claude...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar a Desarrollo
                  </>
                )}
              </Button>
            </div>

            {activeTask && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tarea Activa:</span>
                  <Badge className={getStatusColor(activeTask.status)}>
                    {activeTask.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{activeTask.title}</p>
                <Progress value={activeTask.progress} className="mb-2" />
                <div className="text-xs text-gray-500">{activeTask.progress}% completado</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cola de Desarrollo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay tareas de desarrollo</p>
                </div>
              ) : (
                tasks.slice().reverse().map(task => (
                  <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    {task.progress > 0 && task.status !== 'completed' && task.status !== 'rejected' && (
                      <Progress value={task.progress} className="mb-2" />
                    )}

                    <div className="text-xs text-gray-500 mb-2">
                      {task.createdAt.toLocaleTimeString()}
                    </div>

                    {task.status === 'reviewing' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveTask(task.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectTask(task.id)}
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Rechazar
                        </Button>
                        {task.previewUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(task.previewUrl, '_blank')}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                    )}

                    {task.status === 'completed' && task.completedAt && (
                      <div className="text-xs text-green-600">
                        ✅ Completado: {task.completedAt.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
