
import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, User, Copy, Download } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const ClaudeDirectChat = () => {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy Claude, tu asistente de desarrollo. Tengo acceso completo a Lovable para ejecutar cualquier mejora que necesites. ¿En qué proyecto quieres trabajar hoy?',
      timestamp: new Date()
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsProcessing(true)

    try {
      console.log('🤖 Enviando mensaje a Claude:', userMessage.content)

      const { data, error } = await supabase.functions.invoke('claude-direct-chat', {
        body: {
          message: userMessage.content,
          conversation_history: messages.slice(-10) // Últimos 10 mensajes para contexto
        }
      })

      if (error) throw error

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Si Claude sugiere hacer cambios en Lovable
      if (data.lovable_action) {
        toast({
          title: "Claude está listo para ejecutar",
          description: "Claude puede hacer los cambios directamente en Lovable. ¿Proceder?",
          action: (
            <Button 
              size="sm" 
              onClick={() => executeLovableAction(data.lovable_action)}
            >
              Ejecutar
            </Button>
          )
        })
      }

    } catch (error) {
      console.error('❌ Error al comunicarse con Claude:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Disculpa, tuve un problema técnico. ¿Puedes intentar reformular tu solicitud?',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      toast({
        title: "Error de comunicación",
        description: "Hubo un problema al conectar con Claude",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const executeLovableAction = async (action: any) => {
    try {
      console.log('⚡ Ejecutando acción en Lovable:', action)

      const { data, error } = await supabase.functions.invoke('execute-lovable-action', {
        body: { action }
      })

      if (error) throw error

      toast({
        title: "✅ Cambios aplicados",
        description: "Claude ejecutó los cambios en Lovable exitosamente"
      })

      // Agregar mensaje de confirmación
      const confirmMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Perfecto! He ejecutado los cambios en Lovable:\n\n${data.summary}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, confirmMessage])

    } catch (error) {
      console.error('❌ Error ejecutando acción de Lovable:', error)
      toast({
        title: "Error de ejecución",
        description: "No pude aplicar los cambios en Lovable",
        variant: "destructive"
      })
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copiado",
      description: "Mensaje copiado al portapapeles"
    })
  }

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n')

    const blob = new Blob([conversation], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `claude-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-600" />
              Chat Directo con Claude
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Plan Pro Activo
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportConversation}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
          <p className="text-gray-600">
            Conversa directamente con Claude. Él puede analizar, sugerir mejoras y ejecutar cambios en Lovable automáticamente.
          </p>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white ml-12' 
                    : 'bg-gray-100 mr-12'
                }`}>
                  <div className="flex items-start gap-2 mb-2">
                    {msg.role === 'assistant' && <Bot className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />}
                    {msg.role === 'user' && <User className="w-4 h-4 text-white mt-1 flex-shrink-0" />}
                    <div className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto p-1 h-auto"
                      onClick={() => copyMessage(msg.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="bg-gray-100 rounded-lg p-3 mr-12">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                    <div className="text-sm text-gray-600">Claude está pensando...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ejemplo: 'Analiza el performance de mi app', 'Mejora la UX del checkout', 'Optimiza el código de login'..."
                className="flex-1 min-h-[60px]"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isProcessing}
                size="sm"
                className="self-end px-6"
              >
                {isProcessing ? (
                  <Bot className="w-4 h-4 animate-pulse" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
