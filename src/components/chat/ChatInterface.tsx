
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
  Plus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    title: string
    content: string
    category?: string
  }>
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

const ChatInterface = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      updated_at: new Date().toISOString()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
    setMessages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Hola ${user.email}! He recibido tu mensaje: "${userMessage.content}". Esta es una respuesta de prueba del sistema Cerebro.`,
          timestamp: new Date(),
          sources: [
            {
              title: 'Documento de ejemplo',
              content: 'Contenido de ejemplo',
              category: 'Prueba'
            }
          ]
        }

        setMessages(prev => [...prev, assistantMessage])
        setLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu mensaje.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles"
    })
  }

  const handleFeedback = (messageId: string, rating: 1 | -1) => {
    toast({
      title: "Gracias por tu feedback",
      description: rating === 1 ? "Nos alegra que te haya sido útil" : "Trabajaremos para mejorar"
    })
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 border-r bg-gray-50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Conversaciones</h2>
          <Button
            onClick={createNewConversation}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={currentConversationId === conv.id ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => {
                  setCurrentConversationId(conv.id)
                  setMessages([])
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
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
                  <Badge variant="secondary">Políticas de la empresa</Badge>
                  <Badge variant="secondary">Procedimientos</Badge>
                  <Badge variant="secondary">Recursos</Badge>
                  <Badge variant="secondary">Contactos</Badge>
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
                  <Card
                    className={`max-w-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-500 text-white'
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
                          <div className="space-y-2">
                            {message.sources.map((source, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium">{source.title}</div>
                                {source.category && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {source.category}
                                  </Badge>
                                )}
                              </div>
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
                              onClick={() => handleFeedback(message.id, 1)}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleFeedback(message.id, -1)}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex gap-4 justify-start">
                <Card className="max-w-2xl bg-white border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      Cerebro está pensando...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta algo a Cerebro..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
