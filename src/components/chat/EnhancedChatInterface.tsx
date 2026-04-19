import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import ReactMarkdown from 'react-markdown'
import {
  Send,
  Brain,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Copy,
  Zap,
  StopCircle,
  ExternalLink,
  History,
} from 'lucide-react'
import { useEnhancedChat } from '@/hooks/useEnhancedChat'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const EnhancedChatInterface = () => {
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
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
    stopGeneration,
  } = useEnhancedChat()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentConversation?.messages, isLoading])

  // Autofocus the input on mount + every time the conversation changes
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [currentConversation?.id])

  // Autosize textarea based on content (up to max height)
  const autosize = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  useEffect(() => {
    autosize(inputRef.current)
  }, [input])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const message = input.trim()
    if (!message || isLoading) return

    setInput('')
    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error enviando mensaje',
        description: 'Intenta de nuevo en unos segundos',
        variant: 'destructive',
      })
    }
    // Re-focus after send so you can keep typing
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = send; Shift+Enter = new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewConversation = async () => {
    await createNewConversation()
    setShowHistory(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({ title: 'Copiado al portapapeles' })
  }

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-muted-foreground">Cargando conversaciones...</span>
      </div>
    )
  }

  const ConversationsList = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          Conversaciones
        </div>
        <Button size="sm" variant="outline" onClick={handleNewConversation}>
          <Plus className="w-4 h-4 mr-1" />
          Nueva
        </Button>
      </div>
      <div className="px-3 py-2 border-b flex items-center gap-2">
        <Switch
          id="kb-toggle"
          checked={knowledgeEnabled}
          onCheckedChange={setUseKnowledgeBase}
        />
        <Label htmlFor="kb-toggle" className="text-xs text-slate-600">
          Usar base de conocimiento
        </Label>
        {knowledgeEnabled && (
          <Badge variant="outline" className="text-[10px] ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay conversaciones</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-2.5 rounded-lg cursor-pointer mb-1 transition-colors group ${
                  currentConversation?.id === conv.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-100'
                }`}
                onClick={() => {
                  selectConversation(conv)
                  setShowHistory(false)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.messages.length} mensajes · {conv.updated_at.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
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
  )

  const isEmpty = !currentConversation || currentConversation.messages.length === 0

  return (
    <div className="flex h-full w-full bg-white">
      {/* Desktop: conversations sidebar */}
      <aside className="hidden md:flex w-72 border-r flex-col bg-slate-50">
        <ConversationsList />
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Mobile top bar with history drawer */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b">
          <Sheet open={showHistory} onOpenChange={setShowHistory}>
            <SheetTrigger asChild>
              <Button size="sm" variant="ghost">
                <History className="w-4 h-4 mr-1" />
                Historial
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <ConversationsList />
            </SheetContent>
          </Sheet>
          <div className="text-sm font-medium truncate max-w-[50%]">
            {currentConversation?.title || 'Nueva conversación'}
          </div>
          <Button size="sm" variant="outline" onClick={handleNewConversation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages — scrollable area */}
        <div className="flex-1 min-h-0 overflow-y-auto" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto w-full px-4 py-6">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Hola{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                </h2>
                <p className="text-slate-500 max-w-md">
                  Pregúntame lo que necesites. Puedo consultar tu base de conocimiento
                  e integraciones conectadas.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {[
                    '📝 Notion',
                    '💬 Slack',
                    '📁 Drive',
                    '✉️ Gmail',
                    '📅 Calendar',
                  ].map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentConversation!.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } group`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {message.role === 'assistant' &&
                        message.knowledgeUsed &&
                        message.knowledgeUsed.length > 0 && (
                          <Badge variant="outline" className="text-[10px] mb-2">
                            <Zap className="w-3 h-3 mr-1" />
                            {message.knowledgeUsed.length} fuentes
                          </Badge>
                        )}
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:my-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/40">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-slate-200/50 text-[10px]"
                              >
                                📄 Ver fuentes ({message.sources.length})
                              </Badge>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Fuentes consultadas</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                {message.sources.map((source: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-slate-50 rounded p-4 border"
                                  >
                                    <div className="font-medium text-indigo-600 mb-2">
                                      {typeof source === 'string'
                                        ? source
                                        : source?.title || 'Fuente'}
                                    </div>
                                    {typeof source === 'object' && source?.content && (
                                      <div className="text-sm text-slate-600">
                                        {source.content}
                                      </div>
                                    )}
                                    {typeof source === 'object' && source?.file_url && (
                                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                        <span>Proyecto: {source.project || 'General'}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-auto p-1"
                                          onClick={() => window.open(source.file_url, '_blank')}
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
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-[10px] ${
                            message.role === 'user'
                              ? 'text-indigo-100'
                              : 'text-slate-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                      <span className="text-sm text-slate-500">Pensando...</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 h-6"
                        onClick={stopGeneration}
                      >
                        <StopCircle className="w-3 h-3 mr-1" />
                        Detener
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input — always anchored at the bottom */}
        <div className="shrink-0 border-t bg-white">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto w-full px-4 py-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 px-3 py-2 shadow-sm">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                autoFocus
                placeholder={
                  knowledgeEnabled
                    ? 'Pregúntame sobre tu empresa...'
                    : 'Escribe un mensaje... (Enter para enviar, Shift+Enter para salto de línea)'
                }
                disabled={isLoading}
                className="flex-1 resize-none bg-transparent outline-none text-sm md:text-base placeholder:text-slate-400 max-h-[200px] py-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Cerebro puede cometer errores. Verifica información importante.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}

export default EnhancedChatInterface
