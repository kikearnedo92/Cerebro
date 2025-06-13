
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Bot, User, FileText, Brain, Sparkles, Loader2 } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversations } from '@/hooks/useConversations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const ConversationalChatInterface = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { createConversation, updateConversationTitle } = useConversations()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId)
      loadConversationMessages(conversationId)
    } else {
      setCurrentConversationId(null)
      setMessages([])
    }
  }, [conversationId])

  const loadConversationMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading conversation messages:', error)
    }
  }

  const checkQueryLimit = async (): Promise<boolean> => {
    if (!user || !profile) return false

    const today = new Date().toISOString().split('T')[0]
    const limit = profile.daily_query_limit || 50
    const used = profile.queries_used_today || 0
    const lastReset = profile.last_query_reset

    // Reset counter if it's a new day
    if (lastReset !== today) {
      const { error } = await supabase
        .from('profiles')
        .update({
          queries_used_today: 0,
          last_query_reset: today
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error resetting query counter:', error)
      }
      return true
    }

    // Check if limit is reached (unlimited if limit is -1)
    if (limit !== -1 && used >= limit) {
      toast({
        title: "Límite de consultas alcanzado",
        description: `Has alcanzado tu límite diario de ${limit} consultas. Contacta al administrador.`,
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const incrementQueryCount = async () => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        queries_used_today: (profile?.queries_used_today || 0) + 1
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error incrementing query count:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user) return

    // Check query limits
    const canQuery = await checkQueryLimit()
    if (!canQuery) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      let activeConversationId = currentConversationId

      // Create new conversation if none exists
      if (!activeConversationId) {
        activeConversationId = await createConversation('Nueva conversación')
        setCurrentConversationId(activeConversationId)
        navigate(`/chat/${activeConversationId}`, { replace: true })
      }

      // Add user message to UI immediately
      const newUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, newUserMessage])

      // Save user message to database
      const { data: savedUserMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'user',
          content: userMessage
        })
        .select()
        .single()

      if (userError) {
        console.error('Error saving user message:', userError)
      } else {
        // Update message with real ID
        setMessages(prev => prev.map(msg => 
          msg.id === newUserMessage.id ? { ...savedUserMessage } : msg
        ))
      }

      // Update conversation title with first message
      if (messages.length === 0) {
        const title = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage
        await updateConversationTitle(activeConversationId, title)
      }

      // Call AI function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: userMessage,
          useKnowledgeBase: useKnowledgeBase,
          conversationId: activeConversationId
        }
      })

      if (error) {
        throw error
      }

      // Add AI response to messages
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiMessage])

      // Save AI message to database
      const { error: aiError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content: data.response
        })

      if (aiError) {
        console.error('Error saving AI message:', aiError)
      }

      // Increment query count
      await incrementQueryCount()

    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: "Hubo un problema con el chat. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CEREBRO AI</h1>
              <p className="text-sm text-gray-600">Tu asistente inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="knowledge-toggle" className="text-sm font-medium">
                Usar base de conocimiento
              </Label>
              <Switch
                id="knowledge-toggle"
                checked={useKnowledgeBase}
                onCheckedChange={setUseKnowledgeBase}
              />
            </div>
            <Badge variant={useKnowledgeBase ? "default" : "secondary"}>
              {useKnowledgeBase ? (
                <>
                  <Brain className="w-3 h-3 mr-1" />
                  Retorna
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  OpenAI
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Hola! Soy CEREBRO AI
              </h3>
              <p className="text-gray-600 mb-4">
                {useKnowledgeBase 
                  ? "Estoy aquí para ayudarte con información específica de Retorna. ¿En qué puedo asistirte?"
                  : "Estoy funcionando con OpenAI. Puedo ayudarte con cualquier pregunta general."
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setInput('¿Cuáles son las políticas de Retorna?')}>
                  <CardContent className="p-4">
                    <FileText className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-medium mb-1">Políticas empresariales</h4>
                    <p className="text-sm text-gray-600">Consulta sobre normativas y procedimientos</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setInput('¿Cómo funciona el proceso de onboarding?')}>
                  <CardContent className="p-4">
                    <User className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-medium mb-1">Procesos de trabajo</h4>
                    <p className="text-sm text-gray-600">Información sobre flujos y procedimientos</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-purple-600' 
                        : 'bg-gradient-to-br from-purple-600 to-blue-600'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <Card className={`${message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white'}`}>
                    <CardContent className="p-4">
                      <div className="prose max-w-none">
                        {formatMessage(message.content)}
                      </div>
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-600">Pensando...</span>
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
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          
          {profile && (
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>
                Consultas hoy: {profile.queries_used_today || 0}/{profile.daily_query_limit === -1 ? '∞' : profile.daily_query_limit}
              </span>
              <span>
                Modo: {useKnowledgeBase ? 'Base de conocimiento' : 'OpenAI general'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationalChatInterface
