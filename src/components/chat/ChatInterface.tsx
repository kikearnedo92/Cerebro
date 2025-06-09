
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import FileUpload from './FileUpload'

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
  const [showFileUpload, setShowFileUpload] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadConversations = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading conversations:', error)
      return
    }

    setConversations(data || [])
  }

  const loadConversationMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    const formattedMessages: Message[] = data.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.created_at),
      sources: msg.sources || undefined
    }))

    setMessages(formattedMessages)
  }

  const createNewConversation = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'Nueva conversación'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return
    }

    setCurrentConversationId(data.id)
    setMessages([])
    loadConversations()
  }

  const searchKnowledgeBase = async (query: string) => {
    const { data } = await supabase
      .from('knowledge_base')
      .select('title, content, category')
      .eq('active', true)
      .textSearch('fts', query.replace(/\s+/g, ' & '))
      .limit(5)

    return data || []
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
      // Create conversation if none exists
      let conversationId = currentConversationId
      if (!conversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: input.trim().slice(0, 50) + '...'
          })
          .select()
          .single()

        if (error) throw error
        conversationId = data.id
        setCurrentConversationId(conversationId)
        loadConversations()
      }

      // Save user message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content
        })

      // Search knowledge base
      const sources = await searchKnowledgeBase(input.trim())
      const context = sources.length > 0 
        ? `Contexto relevante:\n${sources.map(s => `${s.title}: ${s.content}`).join('\n\n')}`
        : ''

      // Call OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Eres Cerebro, el asistente de IA de Retorna. Ayudas a empleados con información de la empresa. 
              Responde en español, sé conciso y útil. ${context ? 'Usa el contexto proporcionado cuando sea relevante.' : ''}`
            },
            { role: 'user', content: userMessage.content },
            ...(context ? [{ role: 'system', content: context }] : [])
          ],
          stream: false,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta de OpenAI')
      }

      const data = await response.json()
      const assistantContent = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
          sources: sources.length > 0 ? sources : null
        })

      // Track analytics
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: user.id,
          query: userMessage.content,
          ai_provider: 'openai',
          sources_used: sources
        })

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu mensaje.",
        variant: "destructive"
      })
    } finally {
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

  const handleFeedback = async (messageId: string, rating: 1 | -1) => {
    if (!user) return

    try {
      // Find the user message that prompted this response
      const messageIndex = messages.findIndex(m => m.id === messageId)
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null

      if (userMessage && userMessage.role === 'user') {
        await supabase
          .from('usage_analytics')
          .insert({
            user_id: user.id,
            query: userMessage.content,
            rating: rating,
            ai_provider: 'openai'
          })
      }

      toast({
        title: "Gracias por tu feedback",
        description: rating === 1 ? "Nos alegra que te haya sido útil" : "Trabajaremos para mejorar"
      })
    } catch (error) {
      console.error('Error saving feedback:', error)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!user) return

    for (const file of files) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `uploads/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('retorna-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Record in database
        await supabase
          .from('uploaded_files')
          .insert({
            user_id: user.id,
            filename: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type
          })

        toast({
          title: "Archivo subido",
          description: `${file.name} se ha subido correctamente`
        })

      } catch (error) {
        console.error('Error uploading file:', error)
        toast({
          title: "Error",
          description: `No se pudo subir ${file.name}`,
          variant: "destructive"
        })
      }
    }

    setShowFileUpload(false)
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
                  loadConversationMessages(conv.id)
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => copyToClipboard(message.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copiar respuesta</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleFeedback(message.id, 1)}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Útil</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleFeedback(message.id, -1)}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>No útil</TooltipContent>
                            </Tooltip>
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
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta algo a Cerebro..."
                  disabled={loading}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {showFileUpload && (
              <div className="mt-4">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
