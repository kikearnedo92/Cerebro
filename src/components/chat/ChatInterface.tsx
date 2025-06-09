
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  Clock,
  Sparkles,
  MessageSquare,
  Plus,
  Bot,
  User as UserIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/hooks/useChat'
import { toast } from '@/hooks/use-toast'

const ChatInterface = () => {
  const { user } = useAuth()
  const { messages, loading, sendMessage, clearMessages } = useChat()
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && user) {
      setTimeout(() => {
        sendMessage("¡Hola! Soy Cerebro, tu asistente de Retorna. ¿En qué puedo ayudarte hoy?")
      }, 500)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    await sendMessage(input)
    setInput('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    })
  }

  const handleFeedback = (messageId: string, rating: 'up' | 'down') => {
    toast({
      title: "Gracias por tu feedback",
      description: rating === 'up' ? "Nos alegra que te haya sido útil" : "Trabajaremos para mejorar"
    })
  }

  const startNewConversation = () => {
    clearMessages()
    setTimeout(() => {
      sendMessage("¡Hola! Soy Cerebro, tu asistente de Retorna. ¿En qué puedo ayudarte hoy?")
    }, 100)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Chat con Cerebro</h1>
              <p className="text-sm text-gray-500">Tu asistente inteligente de Retorna</p>
            </div>
          </div>
          <Button onClick={startNewConversation} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Hola! Soy Cerebro</h3>
              <p className="text-muted-foreground mb-4">
                Tu asistente de conocimiento de Retorna. ¿En qué puedo ayudarte hoy?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Políticas por país</Badge>
                <Badge variant="secondary">Procedimientos ATC</Badge>
                <Badge variant="secondary">Scripts de respuesta</Badge>
                <Badge variant="secondary">Normativas</Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <Card
                  className={`max-w-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white border'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Fuentes consultadas:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleFeedback(message.id, 'up')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleFeedback(message.id, 'down')}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="max-w-2xl bg-white border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    Cerebro está procesando tu consulta...
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre políticas, procedimientos, normativas..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Cerebro puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
