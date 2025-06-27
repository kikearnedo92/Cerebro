
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Github, MessageSquare, CheckCircle, Clock, AlertCircle, Code, Bot, Zap } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const AutoDevDashboard = () => {
  const [githubUrl, setGithubUrl] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [activeChat, setActiveChat] = useState(false)
  const [message, setMessage] = useState('')

  const handleGithubConnect = async () => {
    if (!githubUrl.trim()) {
      toast({
        title: "Error",
        description: "Ingresa la URL de tu repositorio GitHub",
        variant: "destructive"
      })
      return
    }

    setIsConnected(true)
    toast({
      title: "✅ Repositorio conectado",
      description: "Tu AI Developer ya tiene acceso a tu código"
    })
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    setMessage('')
    toast({
      title: "💬 Mensaje enviado a Claude",
      description: "Tu AI Developer está analizando la solicitud..."
    })
  }

  const developmentTasks = [
    {
      id: 1,
      title: "Optimizar performance del chat",
      status: "in_progress",
      aiRecommendation: "Implementar lazy loading y memoización",
      priority: "high"
    },
    {
      id: 2,
      title: "Agregar validación de formularios",
      status: "pending_review",
      aiRecommendation: "Usar Zod para validación type-safe",
      priority: "medium"
    },
    {
      id: 3,
      title: "Mejorar responsive design",
      status: "completed",
      aiRecommendation: "Aplicar breakpoints Tailwind optimizados",
      priority: "low"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AutoDev</h1>
        <p className="text-gray-600">AI-powered development with Claude + Lovable integration</p>
      </div>

      {/* GitHub Connection */}
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Conecta tu repositorio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Conecta tu repositorio GitHub para que tu AI Developer pueda analizar y mejorar tu código automáticamente.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/tu-usuario/tu-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleGithubConnect}>
                <Github className="w-4 h-4 mr-2" />
                Conectar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Connected State */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Developer Chat */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Habla con tu AI Developer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
                {!activeChat ? (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Cuéntame qué necesitas desarrollar o mejorar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm"><strong>Tú:</strong> {message}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm"><strong>Claude:</strong> Perfecto, voy a analizar tu código y crear una propuesta de mejora. Dame un momento...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ej: Necesito optimizar el performance del chat, agregar autenticación, mejorar el diseño..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={() => {
                  handleSendMessage()
                  setActiveChat(true)
                }}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Repository Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5 text-green-500" />
                Repositorio conectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Acceso completo al código</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Claude AI integrado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Lovable deployment ready</span>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700">
                    <strong>Repo:</strong> {githubUrl}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-500" />
                Cola de desarrollo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tareas activas</span>
                  <Badge variant="outline">{developmentTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {developmentTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {getStatusIcon(task.status)}
                      <span className="text-xs truncate flex-1">{task.title}</span>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Development Tasks */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Tareas de desarrollo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {developmentTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                          {task.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>AI Recommendation:</strong> {task.aiRecommendation}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending_review' && (
                        <>
                          <Button size="sm" variant="outline">
                            Ver cambios
                          </Button>
                          <Button size="sm">
                            Aprobar
                          </Button>
                        </>
                      )}
                      {task.status === 'in_progress' && (
                        <Button size="sm" variant="outline">
                          Ver progreso
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-medium">Performance Scan</h3>
                <p className="text-sm text-gray-600">Analizar y optimizar código</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Security Review</h3>
                <p className="text-sm text-gray-600">Detectar vulnerabilidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Code className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-medium">Code Quality</h3>
                <p className="text-sm text-gray-600">Mejorar legibilidad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
