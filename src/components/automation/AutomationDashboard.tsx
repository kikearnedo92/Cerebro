
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Bot, Code, CheckCircle, Clock, Zap, Settings, Play } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const AutomationDashboard = () => {
  const [activeTab, setActiveTab] = useState('claude-chat')
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([])

  const handleSendToClaude = () => {
    if (!message.trim()) return

    const newMessage = { role: 'user', content: message }
    setChatHistory(prev => [...prev, newMessage])
    
    // Simulate Claude response
    setTimeout(() => {
      const claudeResponse = {
        role: 'claude',
        content: `Entiendo que necesitas: "${message}". Voy a crear una especificación detallada para Lovable y empezar el desarrollo. Te notificaré cuando esté listo para revisión.`
      }
      setChatHistory(prev => [...prev, claudeResponse])
    }, 1000)

    setMessage('')
    toast({
      title: "Enviado a Claude",
      description: "Tu AI Developer está trabajando en tu solicitud"
    })
  }

  const workflows = [
    {
      id: '1',
      name: 'Claude → Lovable → Review',
      description: 'Desarrollo automático con revisión AI',
      status: 'active',
      lastRun: '2 minutos',
      success: 98
    },
    {
      id: '2',
      name: 'Bug Detection & Fix',
      description: 'Detección y corrección automática de bugs',
      status: 'active',
      lastRun: '15 minutos',
      success: 95
    },
    {
      id: '3',
      name: 'Performance Optimization',
      description: 'Optimización continua de performance',
      status: 'paused',
      lastRun: '1 hora',
      success: 92
    }
  ]

  const devTasks = [
    {
      id: 1,
      title: "Implementar autenticación OAuth",
      status: "claude_analyzing",
      progress: 25
    },
    {
      id: 2,
      title: "Optimizar queries de base de datos",
      status: "lovable_coding",
      progress: 60
    },
    {
      id: 3,
      title: "Agregar tests unitarios",
      status: "pending_review",
      progress: 100
    }
  ]

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'claude_analyzing':
        return 'bg-blue-100 text-blue-700'
      case 'lovable_coding':
        return 'bg-purple-100 text-purple-700'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>
        <p className="text-gray-600">Claude ↔ Lovable integration for automated development</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'claude-chat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('claude-chat')}
          className={activeTab === 'claude-chat' ? 'bg-white shadow-sm' : ''}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Habla con Claude
        </Button>
        <Button
          variant={activeTab === 'dev-queue' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('dev-queue')}
          className={activeTab === 'dev-queue' ? 'bg-white shadow-sm' : ''}
        >
          <Code className="w-4 h-4 mr-2" />
          Cola de desarrollo
        </Button>
        <Button
          variant={activeTab === 'workflows' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('workflows')}
          className={activeTab === 'workflows' ? 'bg-white shadow-sm' : ''}
        >
          <Settings className="w-4 h-4 mr-2" />
          Workflows
        </Button>
      </div>

      {/* Claude Chat Tab */}
      {activeTab === 'claude-chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Tu AI Developer Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[400px] overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 mt-32">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">¡Hola! Soy Claude, tu AI Developer</h3>
                    <p className="text-sm">Cuéntame qué necesitas desarrollar. Puedo:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Crear nuevas funcionalidades</li>
                      <li>• Optimizar código existente</li>
                      <li>• Detectar y corregir bugs</li>
                      <li>• Mejorar UX/UI</li>
                      <li>• Implementar integraciones</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`p-3 rounded ${
                        msg.role === 'user' 
                          ? 'bg-white border ml-8' 
                          : 'bg-blue-50 border border-blue-200 mr-8'
                      }`}>
                        <p className="text-sm">
                          <strong>{msg.role === 'user' ? 'Tú' : 'Claude'}:</strong> {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ej: Necesito agregar un sistema de notificaciones push, optimizar la carga de imágenes, crear un dashboard de analytics..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button onClick={handleSendToClaude} className="self-end">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Active Development */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desarrollo activo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tareas en curso</span>
                    <Badge variant="outline">{devTasks.filter(t => t.status !== 'completed').length}</Badge>
                  </div>
                  {devTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">{task.title}</span>
                        <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Scan de performance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bot className="w-4 h-4 mr-2" />
                  Review de seguridad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Code className="w-4 h-4 mr-2" />
                  Optimizar código
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Development Queue Tab */}
      {activeTab === 'dev-queue' && (
        <Card>
          <CardHeader>
            <CardTitle>Cola de desarrollo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devTasks.map(task => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge className={getTaskStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                  <div className="flex gap-2">
                    {task.status === 'pending_review' && (
                      <>
                        <Button size="sm" variant="outline">Ver cambios</Button>
                        <Button size="sm">Aprobar</Button>
                      </>
                    )}
                    {task.status !== 'pending_review' && (
                      <Button size="sm" variant="outline">Ver detalles</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <Card>
          <CardHeader>
            <CardTitle>Workflows automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflows.map(workflow => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      workflow.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                      <p className="text-xs text-gray-500">
                        Último run: {workflow.lastRun} • {workflow.success}% éxito
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {workflow.status === 'active' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
