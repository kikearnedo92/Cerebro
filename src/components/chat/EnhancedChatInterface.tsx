import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import ReactMarkdown from 'react-markdown'
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
  StopCircle,
  ExternalLink
} from 'lucide-react'
import { useEnhancedChat } from '@/hooks/useEnhancedChat'
import { useAuth } from '@/hooks/useAuth'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { toast } from '@/hooks/use-toast'
import FileUpload from '@/components/admin/FileUpload'
import EscalationEngine from '@/components/chat/EscalationEngine'
import SmartEscalationEngine from '@/components/chat/SmartEscalationEngine'

const EnhancedChatInterface = () => {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>()
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false)
  const [smartEscalationEnabled, setSmartEscalationEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [lastUserMessage, setLastUserMessage] = useState('')
  
  const { user } = useAuth()
  const { items: knowledgeItems, deleteItem, toggleActive } = useKnowledgeBase()
  const {
    conversations,
    currentConversation,
    isLoading,
    isLoadingConversations,
    useKnowledgeBase: knowledgeEnabled,
    setUseKnowledgeBase,
    sendMessage,
    createNewConversation,
    selectConversation,
    deleteConversation,
    stopGeneration
  } = useEnhancedChat()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('')
    setLastUserMessage(message)
    
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

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id)
      toast({
        title: "🗑️ Documento Eliminado",
        description: "Removido de la base de conocimiento"
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive(id, !currentActive)
      toast({
        title: currentActive ? "📴 Documento Desactivado" : "✅ Documento Activado",
        description: currentActive ? "Ya no se usará en búsquedas" : "Disponible para búsquedas"
      })
    } catch (error) {
      console.error('Error toggling active:', error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado",
        variant: "destructive"
      })
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "✅ Copiado",
      description: "Mensaje copiado al portapapeles"
    })
  }

  const hasLowConfidence = (content: string, sources: any[]) => {
    // Disable escalation engine by default - user must enable it explicitly
    return false
  }

  const handleEscalationApply = (suggestion: any) => {
    const escalationText = suggestion.template
    setInput(escalationText)
    inputRef.current?.focus()
    toast({
      title: "Sugerencia aplicada",
      description: `Template de escalación para ${suggestion.contact.name} añadido`
    })
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
    <div className="flex h-screen bg-background">
      {/* Sidebar - Mobile responsive */}
      <div className="w-80 md:w-80 hidden md:flex border-r bg-muted/20 flex-col">
        <div className="p-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              CEREBRO Memory
            </h2>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}>
                <BookOpen className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleNewConversation}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="knowledge-base"
              checked={knowledgeEnabled}
              onCheckedChange={setUseKnowledgeBase}
            />
            <Label htmlFor="knowledge-base" className="text-sm">
              Usar base de conocimiento
            </Label>
            {knowledgeEnabled && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Activo
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {showKnowledgeBase ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Base de Conocimiento</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{knowledgeItems.length} docs</span>
                    <FileUpload 
                      maxFiles={5}
                      onUploadComplete={() => {
                        window.location.reload()
                      }}
                    />
                  </div>
                </div>
                {knowledgeItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay documentos</p>
                    <p className="text-xs">Agrega contenido para empezar</p>
                  </div>
                ) : (
                  knowledgeItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors group border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3 text-primary" />
                            <p className="text-sm font-medium truncate">
                              {item.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Proyecto: {item.project}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-xs text-muted-foreground">
                              {item.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(item.id, item.active)}
                            title={item.active ? 'Desactivar' : 'Activar'}
                          >
                            {item.active ? (
                              <XCircle className="w-3 h-3 text-orange-500" />
                            ) : (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar documento"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-2 md:p-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                {currentConversation?.title || 'Nueva Conversación'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Demo Ready
                </Badge>
                {knowledgeEnabled && (
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    KB Active
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

        {/* Messages Area - Mobile responsive */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-2 md:p-4">
            <div className="space-y-4 min-h-full">
              {!currentConversation || currentConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[300px] md:min-h-[400px]">
                  <div className="text-center px-4">
                    <Brain className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-primary opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      ¡Hola! Soy CEREBRO
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 max-w-md mx-auto">
                      Tu plataforma de conocimiento inteligente. Pregúntame sobre procesos de Retorna, 
                      políticas por país, ATC, compliance, o cualquier tema de la base de conocimiento.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary" className="text-xs">🇨🇱 Chile</Badge>
                      <Badge variant="secondary" className="text-xs">🇨🇴 Colombia</Badge>
                      <Badge variant="secondary" className="text-xs">🇵🇪 Perú</Badge>
                      <Badge variant="secondary" className="text-xs">🇪🇸 España</Badge>
                      <Badge variant="secondary" className="text-xs">📞 ATC</Badge>
                      <Badge variant="secondary" className="text-xs">📋 Compliance</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[80%] p-3 md:p-4 rounded-lg ${
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
                        
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Compact sources with modal */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                                    📄 Ver fuentes ({message.sources.length})
                                  </Badge>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Fuentes consultadas</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                     {message.sources.map((source, index) => (
                                       <div key={index} className="bg-muted/50 rounded p-4">
                                         <div className="font-medium text-primary mb-2">
                                           {typeof source === 'string' ? source : (source as any)?.title || 'Fuente'}
                                         </div>
                                         {typeof source === 'object' && source && (source as any).content && (
                                           <div className="text-sm text-muted-foreground">
                                             {(source as any).content}
                                           </div>
                                         )}
                                         {typeof source === 'object' && source && (source as any).file_url && (
                                           <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                             <span>Proyecto: {(source as any).project || 'General'}</span>
                                             <Button
                                               variant="ghost"
                                               size="sm"
                                               className="h-auto p-1"
                                               onClick={() => window.open((source as any).file_url, '_blank')}
                                             >
                                               <ExternalLink className="w-3 h-3" />
                                             </Button>
                                           </div>
                                         )}
                                       </div>
                                     ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        )}

                        {/* Smart Escalation Engine - Always shown with toggle */}
                        {message.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <SmartEscalationEngine 
                              message={lastUserMessage}
                              onSuggestionApply={handleEscalationApply}
                              enabled={smartEscalationEnabled}
                              onEnabledChange={setSmartEscalationEnabled}
                            />
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

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
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Mobile responsive */}
        <div className="p-2 md:p-4 border-t bg-background flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={knowledgeEnabled ? "Pregunta sobre Retorna..." : "Escribe tu mensaje..."}
              disabled={isLoading}
              className="flex-1 text-sm md:text-base"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="sm" className="md:size-default">
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {knowledgeEnabled && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Respuestas enriquecidas con la base de conocimiento
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedChatInterface