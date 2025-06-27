
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Zap, User, Brain, Sparkles, Loader2, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNucleoChat } from '@/hooks/useNucleoChat'
import ImageUpload from '@/components/ui/ImageUpload'

const NucleoMemoryInterface = () => {
  const { profile } = useAuth()
  const { messages, loading, useKnowledgeBase, sendMessage, clearMessages, toggleKnowledgeBase } = useNucleoChat()
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() && !selectedImage) return

    const messageText = input
    setInput('')
    setSelectedImage(null)
    
    await sendMessage(messageText, selectedImage || undefined)
  }

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO Memory</h1>
              <p className="text-xs text-gray-600">Commercial AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="knowledge-toggle" className="text-sm font-medium">
                Base de conocimiento NÚCLEO
              </Label>
              <Switch
                id="knowledge-toggle"
                checked={useKnowledgeBase}
                onCheckedChange={toggleKnowledgeBase}
              />
            </div>
            <Badge variant={useKnowledgeBase ? "default" : "secondary"}>
              {useKnowledgeBase ? (
                <>
                  <Brain className="w-3 h-3 mr-1" />
                  NÚCLEO KB
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  OpenAI
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO</span>
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Tu asistente AI comercial especializado en estrategia de negocio, growth marketing, automatización y desarrollo de productos. 
                {useKnowledgeBase 
                  ? " Tengo acceso a la base de conocimiento comercial de NÚCLEO para ayudarte con estrategias específicas."
                  : " Funcionando en modo general para cualquier consulta de negocio."
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cómo puedo mejorar mi estrategia de growth marketing?')}>
                  <CardContent className="p-6">
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Growth Strategy</h4>
                    <p className="text-sm text-gray-600">Estrategias de crecimiento y adquisición de usuarios</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('Ayúdame a planificar el lanzamiento de mi producto')}>
                  <CardContent className="p-6">
                    <Zap className="w-8 h-8 text-green-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Product Launch</h4>
                    <p className="text-sm text-gray-600">Planificación y ejecución de lanzamientos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-blue-500 via-blue-600 to-green-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Zap className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.isError 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-white border border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="prose max-w-none">
                        {formatMessage(message.content)}
                      </div>
                      {message.documentsUsed && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {message.documentsUsed} documentos consultados
                          </Badge>
                        </div>
                      )}
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-gray-600">
                        {selectedImage ? 'Analizando imagen y consultando NÚCLEO...' : 'Procesando consulta en NÚCLEO...'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Describe qué quieres saber sobre esta imagen..." : "Pregúntame sobre estrategia, growth, lanzamientos, automatización..."}
                disabled={loading}
                className="flex-1"
                name="message"
              />
              <Button type="submit" disabled={loading || (!input.trim() && !selectedImage)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <ImageUpload 
                onImageSelect={setSelectedImage} 
                disabled={loading}
              />
              
              {profile && (
                <div className="text-xs text-gray-500">
                  Consultas hoy: {profile.queries_used_today || 0}/{profile.daily_query_limit === -1 ? '∞' : profile.daily_query_limit}
                  {' • '}
                  Modo: {useKnowledgeBase ? 'Base de conocimiento NÚCLEO' : 'OpenAI general'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NucleoMemoryInterface
