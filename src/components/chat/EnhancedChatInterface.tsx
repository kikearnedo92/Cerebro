import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Brain, 
  FileText, 
  Sparkles, 
  MessageSquare, 
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen,
  Target,
  StopCircle
} from 'lucide-react'
import { useEnhancedChat } from '@/hooks/useEnhancedChat'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const EnhancedChatInterface = () => {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useAuth()
  const {
    conversations,
    currentConversation,
    isLoading,
    isLoadingConversations,
    useKnowledgeBase,
    setUseKnowledgeBase,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    stopGeneration
  } = useEnhancedChat()

  // Auto-scroll to bottom cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  // Focus en input cuando se carga
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    
    try {
      await sendMessage(message, selectedImage)
      setSelectedImage(undefined)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleNewConversation = async () => {
    await createNewConversation()
    inputRef.current?.focus()
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "✅ Copiado",
      description: "Mensaje copiado al portapapeles"
    })
  }

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Cargando conversaciones...</span>
      </div>
    )
  }

  return (
    <div className="flex h-[800px] bg-background border rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar de conversaciones */}
      <div className="w-80 border-r bg-muted/20">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              CEREBRO Memory
            </h2>
            <Button size="sm" onClick={handleNewConversation}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Toggle Knowledge Base */}
          <div className="flex items-center space-x-2">
            <Switch
              id="knowledge-base"
              checked={useKnowledgeBase}
              onCheckedChange={setUseKnowledgeBase}
            />
            <Label htmlFor="knowledge-base" className="text-sm">
              Usar base de conocimiento
            </Label>
            {useKnowledgeBase && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Activo
              </Badge>
            )}
          </div>
        </div>

        {/* Lista de conversaciones */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones</p>
                <p className="text-xs">Crea una nueva para empezar</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors group ${
                    currentConversation?.id === conversation.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.messages.length} mensajes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.updated_at.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conversation.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header del chat */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                {currentConversation?.title || 'Nueva Conversación'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Demo Ready
                </Badge>
                {useKnowledgeBase && (
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Knowledge Active
                  </Badge>
                )}
              </div>
            </div>
            
            {isLoading && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={stopGeneration}
                className="text-destructive"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                Detener
              </Button>
            )}
          </div>
        </div>

        {/* Área de mensajes */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {!currentConversation || currentConversation.messages.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  ¡Hola! Soy CEREBRO
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Tu plataforma de conocimiento inteligente. Pregúntame sobre procesos de Retorna, 
                  políticas por país, ATC, compliance, o cualquier tema de la base de conocimiento.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">🇨🇱 Chile</Badge>
                  <Badge variant="secondary">🇨🇴 Colombia</Badge>
                  <Badge variant="secondary">🇵🇪 Perú</Badge>
                  <Badge variant="secondary">🇪🇸 España</Badge>
                  <Badge variant="secondary">📞 ATC</Badge>
                  <Badge variant="secondary">📋 Compliance</Badge>
                </div>
              </div>
            ) : (
              currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.role === 'user' ? 'Tú' : 'CEREBRO'}
                        </span>
                        {message.role === 'assistant' && message.knowledgeUsed && message.knowledgeUsed.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {message.knowledgeUsed.length} fuentes
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyMessage(message.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-sm">
                      {formatMessage(message.content)}
                    </div>

                    {/* Mostrar fuentes si las hay */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">📚 Fuentes consultadas:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {source}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">CEREBRO está pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input del chat */}
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={useKnowledgeBase ? "Pregunta sobre Retorna, procesos, políticas..." : "Escribe tu mensaje..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {useKnowledgeBase && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Respuestas enriquecidas con la base de conocimiento de Retorna
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedChatInterface