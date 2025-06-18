import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Bot, User, FileText, Brain, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversations } from '@/hooks/useConversations'
import ImageUpload from '@/components/ui/ImageUpload'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  imageData?: string
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    if ((!input.trim() && !selectedImage) || isLoading || !user) return

    const canQuery = await checkQueryLimit()
    if (!canQuery) return

    const userMessage = input.trim() || (selectedImage ? '[Imagen adjunta]' : '')
    const imageData = selectedImage
    
    setInput('')
    setSelectedImage(null)
    setIsLoading(true)

    try {
      let activeConversationId = currentConversationId

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
        timestamp: new Date().toISOString(),
        imageData: imageData || undefined
      }
      setMessages(prev => [...prev, newUserMessage])

      // Save user message to database
      const { data: savedUserMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          role: 'user',
          content: userMessage,
          image_data: imageData
        })
        .select()
        .single()

      if (userError) {
        console.error('Error saving user message:', userError)
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === newUserMessage.id ? { ...savedUserMessage, imageData: imageData || undefined } : msg
        ))
      }

      // Update conversation title with first message
      if (messages.length === 0) {
        const title = userMessage.length > 50 ? userMessage.substring(0, 50) + '...' : userMessage
        await updateConversationTitle(activeConversationId, title)
      }

      // Call AI function with image support
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: userMessage,
          useKnowledgeBase: useKnowledgeBase,
          conversationId: activeConversationId,
          imageData: imageData
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
      <span key={index}>
  {line}
  {index < content.split('\n').length - 1 && <br />}
</span>
    ))
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy <span className="text-purple-600">CEREBRO</span>
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {useKnowledgeBase 
                  ? "Estoy aquí para ayudarte con información específica de Retorna. Puedo consultar nuestra base de conocimiento, analizar imágenes y responder con el tono profesional de nuestra empresa. ¿En qué puedo asistirte?"
                  : "Estoy funcionando con OpenAI. Puedo ayudarte con cualquier pregunta general y analizar imágenes, pero sin acceso a la información específica de Retorna."
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cuáles son las políticas de Retorna?')}>
                  <CardContent className="p-6">
                    <FileText className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Políticas empresariales</h4>
                    <p className="text-sm text-gray-600">Consulta sobre normativas y procedimientos de Retorna</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" onClick={() => setInput('¿Cómo funciona el proceso de onboarding en Retorna?')}>
                  <CardContent className="p-6">
                    <User className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
                    <h4 className="font-semibold mb-2">Procesos de trabajo</h4>
                    <p className="text-sm text-gray-600">Información sobre flujos y procedimientos internos</p>
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
                        : 'bg-gradient-to-br from-purple-600 to-purple-800'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <Card className={`${message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'}`}>
                    <CardContent className="p-4">
                      {message.imageData && (
                        <div className="mb-3">
                          <img
                            src={message.imageData}
                            alt="Imagen adjunta"
                            className="max-w-xs max-h-48 rounded-lg object-cover"
                          />
                        </div>
                      )}
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-gray-600">
                        {selectedImage ? 'Analizando imagen y consultando...' : 'Analizando tu consulta...'}
                      </span>
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
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedImage ? "Describe qué quieres saber sobre esta imagen..." : "Escribe tu mensaje aquí..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <ImageUpload 
                onImageSelect={setSelectedImage} 
                disabled={isLoading}
              />
              
              {profile && (
                <div className="text-xs text-gray-500">
                  Consultas hoy: {profile.queries_used_today || 0}/{profile.daily_query_limit === -1 ? '∞' : profile.daily_query_limit}
                  {' • '}
                  Modo: {useKnowledgeBase ? 'Base de conocimiento Retorna' : 'OpenAI general'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConversationalChatInterface