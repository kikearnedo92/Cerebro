
import React, { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { createChatCompletion } from '@/lib/openai'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Send, Copy, ThumbsUp, ThumbsDown, Bot, User, Search, Loader2 } from 'lucide-react'
import FileUpload from './FileUpload'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: any[]
}

const ChatInterface = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Search knowledge base before sending to AI
  const searchKnowledgeBase = async (query: string) => {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('active', true)
      .limit(5)

    if (error) {
      console.error('Error searching knowledge base:', error)
      return []
    }

    return data || []
  }

  // Create or get conversation
  const getOrCreateConversation = async () => {
    if (currentConversationId) return currentConversationId

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user?.id,
        title: 'Nueva conversación',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    setCurrentConversationId(data.id)
    return data.id
  }

  // Save message to database
  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        timestamp: new Date().toISOString()
      })

    if (error) throw error
  }

  // Log analytics
  const logAnalytics = async (query: string, responseTime: number, sources: any[]) => {
    const { error } = await supabase
      .from('usage_analytics')
      .insert({
        user_id: user?.id,
        query,
        response_time: responseTime,
        ai_provider: 'openai',
        sources_used: sources,
        created_at: new Date().toISOString()
      })

    if (error) console.error('Error logging analytics:', error)
  }

  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      const startTime = Date.now()
      
      // Search knowledge base first
      const sources = await searchKnowledgeBase(messageText)
      console.log('Knowledge base sources:', sources)

      // Get or create conversation
      const conversationId = await getOrCreateConversation()

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, userMessage])
      await saveMessage(conversationId, 'user', messageText)

      // Prepare context for AI
      const contextContent = sources.length > 0 
        ? sources.map(s => `${s.title}: ${s.content}`).join('\n\n')
        : null

      // Create AI completion
      setIsStreaming(true)
      const completion = await createChatCompletion([
        { role: 'user', content: messageText }
      ], contextContent)

      let assistantResponse = ''
      const reader = completion.body?.getReader()
      
      if (reader) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          sources: sources.length > 0 ? sources : undefined
        }

        setMessages(prev => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  assistantResponse += content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantResponse }
                      : msg
                  ))
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }

        // Save final assistant message
        await saveMessage(conversationId, 'assistant', assistantResponse)
        
        // Log analytics
        const responseTime = Date.now() - startTime
        await logAnalytics(messageText, responseTime, sources)
      }

      setIsStreaming(false)
    },
    onError: (error: any) => {
      setIsStreaming(false)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    sendMessage.mutate(input.trim())
    setInput('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Respuesta copiada al portapapeles"
    })
  }

  const handleFeedback = async (messageId: string, rating: number) => {
    // You could log this feedback for analytics
    toast({
      title: "Gracias por tu feedback",
      description: "Tu valoración nos ayuda a mejorar Cerebro"
    })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">¡Hola! Soy CEREBRO</h2>
              <p className="text-gray-600 max-w-md">
                Soy tu asistente de conocimiento inteligente. Puedo ayudarte con información sobre 
                políticas, procedimientos, investigaciones y más. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <Card className={`max-w-3xl ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                      <CardContent className="p-4">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Search className="w-4 h-4" />
                              <span className="text-sm font-medium">Fuentes consultadas:</span>
                            </div>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {source.title} ({source.project})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message Actions */}
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, 1)}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(message.id, -1)}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <Card className="max-w-3xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CEREBRO está pensando...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta a CEREBRO sobre políticas, procedimientos, investigaciones..."
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isStreaming}
                className="h-[60px] px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* File Upload */}
            <FileUpload />
            
            <p className="text-xs text-gray-500 text-center">
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
