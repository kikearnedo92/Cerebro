
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  documentsFound?: number
  searchStats?: {
    totalDocuments: number
    usedKnowledgeBase: boolean
  }
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // Create a new conversation
  const createConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: 'Nueva conversación'
        })
        .select()
        .single()

      if (error) throw error

      setCurrentConversationId(data.id)
      return data.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  // Load conversation messages
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        sources: msg.attachments?.sources,
        documentsFound: msg.attachments?.documentsFound,
        searchStats: msg.attachments?.searchStats
      }))

      setMessages(loadedMessages)
      setCurrentConversationId(conversationId)
    } catch (error) {
      console.error('Error loading conversation:', error)
      throw error
    }
  }

  // Save message to database
  const saveMessage = async (conversationId: string, message: Omit<Message, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
          attachments: {
            sources: message.sources,
            documentsFound: message.documentsFound,
            searchStats: message.searchStats
          }
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error saving message:', error)
      throw error
    }
  }

  // Send message and get AI response
  const sendMessage = async (content: string, useKnowledgeBase: boolean = true, imageData?: string) => {
    if (!content.trim() && !imageData) return

    setIsLoading(true)

    try {
      // Ensure we have a conversation
      let conversationId = currentConversationId
      if (!conversationId) {
        conversationId = await createConversation()
      }

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date()
      }

      // Add user message to state immediately
      setMessages(prev => [...prev, userMessage])

      // Save user message to database
      const userMessageId = await saveMessage(conversationId, userMessage)
      
      // Update user message with real ID
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, id: userMessageId } : msg
      ))

      console.log('🚀 Sending message to CEREBRO chat-ai function...')
      console.log('📚 Using knowledge base:', useKnowledgeBase)
      console.log('🖼️ Has image:', !!imageData)

      // Call chat AI function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          useKnowledgeBase,
          imageData
        }
      })

      if (aiError) {
        console.error('AI function error:', aiError)
        throw new Error(aiError.message || 'Error calling AI function')
      }

      if (!aiResponse?.response) {
        throw new Error('No response from AI')
      }

      console.log('✅ Received AI response')
      console.log('📊 Documents found:', aiResponse.documentsFound || 0)
      console.log('📚 Sources:', aiResponse.sources?.length || 0)

      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        sources: aiResponse.sources,
        documentsFound: aiResponse.documentsFound,
        searchStats: aiResponse.searchStats
      }

      // Add assistant message to state
      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message to database
      const assistantMessageId = await saveMessage(conversationId, assistantMessage)
      
      // Update assistant message with real ID
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id ? { ...msg, id: assistantMessageId } : msg
      ))

      // Show success feedback if knowledge base was used effectively
      if (useKnowledgeBase && aiResponse.documentsFound > 0) {
        toast({
          title: "Respuesta generada",
          description: `Se consultaron ${aiResponse.documentsFound} documentos de la base de conocimiento`,
          variant: "default"
        })
      }

    } catch (error) {
      console.error('Error in sendMessage:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear current conversation
  const clearConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

  return {
    messages,
    isLoading,
    currentConversationId,
    sendMessage,
    loadConversation,
    createConversation,
    clearConversation
  }
}
