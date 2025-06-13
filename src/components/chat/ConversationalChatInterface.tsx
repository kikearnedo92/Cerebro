
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Plus, MessageSquare, FileText, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const ConversationalChatInterface = () => {
  const { user } = useAuth()
  const {
    conversations,
    currentConversation,
    messages,
    createConversation,
    addMessage,
    selectConversation,
    startNewConversation,
    setMessages
  } = useConversations()

  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !user) return

    const messageContent = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    try {
      let conversationId = currentConversation?.id

      // Crear nueva conversación si no existe
      if (!conversationId) {
        const newConversation = await createConversation(
          messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
        )
        if (!newConversation) throw new Error('No se pudo crear la conversación')
        conversationId = newConversation.id
      }

      // Agregar mensaje del usuario
      await addMessage(conversationId, 'user', messageContent)

      // Llamar a la función de chat AI
      console.log('💬 Sending message to CEREBRO:', messageContent)

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: messageContent,
          userId: user.id,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      // Agregar respuesta del asistente
      await addMessage(
        conversationId, 
        'assistant', 
        data.response,
        data.sources
      )

      console.log('✅ CEREBRO response received')

      // Mostrar info si no encontró contenido relevante
      if (!data.foundRelevantContent) {
        toast({
          title: "Información",
          description: "No se encontró contenido específico en la base de conocimiento. La respuesta se basa en el conocimiento general de CEREBRO.",
          variant: "default"
        })
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Agregar mensaje de error
      if (conversationId) {
        await addMessage(
          conversationId,
          'assistant',
          `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta de nuevo o contacta al administrador.`
        )
      }
      
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu mensaje. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    if (days < 7) return `Hace ${days} días`
    return date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bienvenido a CEREBRO</h2>
            <p className="text-gray-600">Inicia sesión para comenzar a chatear con la IA</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar de conversaciones */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={startNewConversation}
            className="w-full flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Conversación</span>
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {filteredConversations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay conversaciones aún
              </p>
            ) : (
              filteredConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    currentConversation?.id === conversation.id ? 'border-purple-600 bg-purple-50' : ''
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentConversation ? currentConversation.title : 'CEREBRO'}
              </h1>
              <p className="text-sm text-gray-600">Asistente inteligente de Retorna</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Hola {user?.email?.split('@')[0]}! 👋
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  Soy CEREBRO, tu asistente de IA entrenado con el conocimiento de Retorna. 
                  Puedo ayudarte con información sobre procesos, políticas, procedimientos y más.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm max-w-md mx-auto">
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Documentos internos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Políticas y procesos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Atención al cliente</span>
                  </div>
                  <div className="flex items-center space-x-2 text-left">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Compliance</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-purple-600' : 'bg-purple-100'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Card className={`${
                        message.role === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <CardContent className="p-4">
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {message.sources_used && message.sources_used.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Fuentes:</span>
                          {message.sources_used.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <FileText className="w-3 h-3 mr-1" />
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">CEREBRO está pensando</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pregúntale algo a CEREBRO..."
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Presiona Enter para enviar • CEREBRO puede cometer errores, verifica información importante.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationalChatInterface
