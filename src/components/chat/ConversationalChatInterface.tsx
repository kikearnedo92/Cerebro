
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

type ChatMode = 'retorna' | 'openai'

const ConversationalChatInterface = () => {
  const { user } = useAuth()
  const {
    currentConversation,
    messages,
    createConversation,
    addMessage,
  } = useConversations()

  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('retorna')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleChatMode = () => {
    const newMode = chatMode === 'retorna' ? 'openai' : 'retorna'
    setChatMode(newMode)
    toast({
      title: "Modo cambiado",
      description: `Ahora usando modo ${newMode === 'retorna' ? 'Cerebro (Retorna)' : 'OpenAI General'}`
    })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading || !user) return

    const messageContent = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    let activeConversationId = currentConversation?.id

    try {
      // Crear nueva conversación si no existe
      if (!activeConversationId) {
        const newConversation = await createConversation(
          messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : '')
        )
        if (!newConversation) throw new Error('No se pudo crear la conversación')
        activeConversationId = newConversation.id
      }

      // Agregar mensaje del usuario
      await addMessage(activeConversationId, 'user', messageContent)

      // Llamar a la función de chat AI con el modo
      console.log(`💬 Sending message to ${chatMode.toUpperCase()} mode:`, messageContent)

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: messageContent,
          userId: user.id,
          mode: chatMode,
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
        activeConversationId, 
        'assistant', 
        data.response,
        data.sources
      )

      console.log(`✅ ${chatMode.toUpperCase()} response received`)

      // Mostrar info si no encontró contenido relevante en modo Retorna
      if (chatMode === 'retorna' && !data.foundRelevantContent) {
        toast({
          title: "Información",
          description: "No se encontró contenido específico en la base de conocimiento. La respuesta se basa en el conocimiento general de CEREBRO.",
          variant: "default"
        })
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      if (activeConversationId) {
        await addMessage(
          activeConversationId,
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {currentConversation ? currentConversation.title : 'CEREBRO'}
              </h1>
              <p className="text-sm text-muted-foreground">Asistente inteligente de Retorna</p>
            </div>
          </div>
          
          {/* Chat Mode Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">
              {chatMode === 'retorna' ? 'Conocimiento Retorna' : 'OpenAI General'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChatMode}
              className="flex items-center space-x-2"
            >
              {chatMode === 'retorna' ? (
                <ToggleLeft className="w-5 h-5 text-primary" />
              ) : (
                <ToggleRight className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                ¡Hola {user?.email?.split('@')[0]}! 👋
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Soy CEREBRO, tu asistente de IA. Actualmente en modo{' '}
                <Badge variant="outline" className="mx-1">
                  {chatMode === 'retorna' ? 'Conocimiento Retorna' : 'OpenAI General'}
                </Badge>
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-left">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Documentos internos</span>
                </div>
                <div className="flex items-center space-x-2 text-left">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Políticas y procesos</span>
                </div>
                <div className="flex items-center space-x-2 text-left">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Atención al cliente</span>
                </div>
                <div className="flex items-center space-x-2 text-left">
                  <FileText className="w-4 h-4 text-primary" />
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
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Card className={`${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border-border'
                    }`}>
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {message.sources_used && message.sources_used.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Fuentes:</span>
                        {message.sources_used.map((source, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">CEREBRO está pensando</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
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
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Presiona Enter para enviar • CEREBRO puede cometer errores, verifica información importante.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConversationalChatInterface
