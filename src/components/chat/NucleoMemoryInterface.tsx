
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
import { Send, Zap, User, Brain, Sparkles, Loader2, TrendingUp, ExternalLink } from 'lucide-react'
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

  const hasLowConfidence = (content: string, sources: any) => {
    const confidence = typeof sources === 'number' ? sources : 0
    const hasKeywords = /no sé|no tengo información|no encuentro|disculpa/i.test(content)
    return confidence < 2 || hasKeywords
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white border-b border-gray-200 p-2 md:p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between max-w-4xl mx-auto gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO Memory</h1>
              <p className="text-xs text-gray-600">Commercial AI Assistant</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="knowledge-toggle" className="text-xs md:text-sm font-medium">
                Base de conocimiento NÚCLEO
              </Label>
              <Switch
                id="knowledge-toggle"
                checked={useKnowledgeBase}
                onCheckedChange={toggleKnowledgeBase}
              />
            </div>
            <Badge variant={useKnowledgeBase ? "default" : "secondary"} className="text-xs">
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

      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">NÚCLEO</span>
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
                Tu asistente AI comercial especializado en estrategia de negocio, growth marketing, automatización y desarrollo de productos. 
                {useKnowledgeBase 
                  ? " Tengo acceso a la base de conocimiento comercial de NÚCLEO para ayudarte con estrategias específicas."
                  : " Funcionando en modo general para cualquier consulta de negocio."
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cómo puedo mejorar mi estrategia de growth marketing?')}>
                  <CardContent className="p-4 md:p-6">
                    <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mb-2 md:mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2 text-sm md:text-base">Growth Strategy</h4>
                    <p className="text-xs md:text-sm text-gray-600">Estrategias de crecimiento y adquisición de usuarios</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('Ayúdame a planificar el lanzamiento de mi producto')}>
                  <CardContent className="p-4 md:p-6">
                    <Zap className="w-6 h-6 md:w-8 md:h-8 text-green-600 mb-2 md:mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2 text-sm md:text-base">Product Launch</h4>
                    <p className="text-xs md:text-sm text-gray-600">Planificación y ejecución de lanzamientos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[90%] md:max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'}`}>
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-blue-500 via-blue-600 to-green-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      ) : (
                        <Zap className="w-3 h-3 md:w-4 md:h-4 text-white" />
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
                    <CardContent className="p-3 md:p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert text-sm md:text-base">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Compact sources with modal */}
                      {message.documentsUsed && message.documentsUsed > 0 && (
                        <div className="mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                                📄 Ver fuentes ({message.documentsUsed})
                              </Badge>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Fuentes consultadas</DialogTitle>
                              </DialogHeader>
                              <div className="text-sm">
                                Se consultaron {message.documentsUsed} documentos de la base de conocimiento NÚCLEO.
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      
                      {/* Smart Escalation - only show if low confidence */}
                      {message.role === 'assistant' && hasLowConfidence(message.content, message.documentsUsed) && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <Badge variant="outline" className="text-xs text-orange-600">
                            💡 ¿Necesitas ayuda más específica? Considera contactar al equipo comercial.
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
                <div className="flex-shrink-0 mr-2 md:mr-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-green-500 flex items-center justify-center">
                    <Zap className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm md:text-base text-gray-600">
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

      <div className="bg-white border-t border-gray-200 p-2 md:p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2 md:gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Describe qué quieres saber sobre esta imagen..." : "Pregúntame sobre estrategia, growth, lanzamientos, automatización..."}
                disabled={loading}
                className="flex-1 text-sm md:text-base"
                name="message"
              />
              <Button 
                type="submit" 
                disabled={loading || (!input.trim() && !selectedImage)} 
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <ImageUpload 
                onImageSelect={setSelectedImage} 
                disabled={loading}
              />
              
              {profile && (
                <div className="text-xs text-gray-500">
                  <div className="md:hidden">
                    Consultas: {profile.queries_used_today || 0}/{profile.daily_query_limit === -1 ? '∞' : profile.daily_query_limit}
                  </div>
                  <div className="hidden md:block">
                    Consultas hoy: {profile.queries_used_today || 0}/{profile.daily_query_limit === -1 ? '∞' : profile.daily_query_limit}
                    {' • '}
                    Modo: {useKnowledgeBase ? 'Base de conocimiento NÚCLEO' : 'OpenAI general'}
                  </div>
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
