
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Brain, User, Sparkles, Loader2, BookOpen, FileText, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import ImageUpload from '@/components/ui/ImageUpload'

const ConversationalChatInterface = () => {
  const { profile } = useAuth()
  const { messages, loading, useKnowledgeBase, sendMessage, clearMessages, toggleKnowledgeBase } = useChat()
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
    <div className="flex flex-col h-full bg-purple-50">
      <div className="bg-white border-b border-purple-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-900">CEREBRO Memory</h1>
              <p className="text-xs text-purple-600">Internal Knowledge Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="knowledge-toggle" className="text-sm font-medium">
                Base de conocimiento empresarial
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
                  <BookOpen className="w-3 h-3 mr-1" />
                  Retorna KB
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
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy <span className="text-purple-600">CEREBRO</span>
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Tu asistente de conocimiento empresarial interno. Puedo ayudarte con información de la empresa, 
                procedimientos, documentos y cualquier consulta relacionada con Retorna.
                {useKnowledgeBase 
                  ? " Tengo acceso completo a la base de conocimiento empresarial."
                  : " Funcionando en modo general."
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cuáles son nuestros procedimientos de onboarding?')}>
                  <CardContent className="p-6">
                    <BookOpen className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Procedimientos</h4>
                    <p className="text-sm text-gray-600">Consultas sobre procesos empresariales</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cómo funciona nuestro sistema de pagos?')}>
                  <CardContent className="p-6">
                    <Brain className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Conocimiento</h4>
                    <p className="text-sm text-gray-600">Información técnica y empresarial</p>
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
                        ? 'bg-purple-600' 
                        : 'bg-gradient-to-br from-purple-500 to-purple-700'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Brain className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <Card className={`${
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : message.isError 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-white border border-purple-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="prose max-w-none">
                        {formatMessage(message.content)}
                      </div>
                      
                      {/* Mostrar información de documentos consultados */}
                      {message.role === 'assistant' && useKnowledgeBase && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {message.documentsFound && message.documentsFound > 0 ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="w-4 h-4" />
                              <span>{message.documentsFound} documentos consultados</span>
                              {message.sources && message.sources.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-2">
                                  {message.sources.slice(0, 3).map((source, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {source.length > 30 ? `${source.substring(0, 30)}...` : source}
                                    </Badge>
                                  ))}
                                  {message.sources.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{message.sources.length - 3} más
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              <span>Sin documentos específicos encontrados</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
                <Card className="bg-white border border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-gray-600">
                        {useKnowledgeBase 
                          ? 'Consultando base de conocimiento CEREBRO...' 
                          : 'CEREBRO está procesando tu consulta...'
                        }
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

      <div className="bg-white border-t border-purple-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Describe qué quieres saber sobre esta imagen..." : "Pregúntame sobre la empresa, procedimientos, documentos..."}
                disabled={loading}
                className="flex-1"
                name="message"
              />
              <Button type="submit" disabled={loading || (!input.trim() && !selectedImage)} className="bg-purple-600 hover:bg-purple-700">
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
                  Modo: {useKnowledgeBase ? 'Base de conocimiento empresarial' : 'OpenAI general'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConversationalChatInterface
