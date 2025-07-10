import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  knowledgeUsed?: any[]
  sources?: string[]
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  created_at: Date
  updated_at: Date
}

export const useEnhancedChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const { user } = useAuth()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cargar conversaciones del usuario
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return

    try {
      setIsLoadingConversations(true)
      
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading conversations:', error)
        return
      }

      // Cargar mensajes para cada conversación
      const conversationsWithMessages = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('timestamp', { ascending: true })

          return {
            ...conv,
            messages: (messagesData || []).map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              sources: msg.attachments?.knowledge_sources?.map((ks: any) => ks.title) || undefined,
              knowledgeUsed: msg.attachments?.knowledge_sources || undefined
            })),
            created_at: new Date(conv.created_at),
            updated_at: new Date(conv.updated_at)
          }
        })
      )

      setConversations(conversationsWithMessages)
      
      // Si no hay conversación actual, seleccionar la primera
      if (!currentConversation && conversationsWithMessages.length > 0) {
        setCurrentConversation(conversationsWithMessages[0])
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const createNewConversation = async (title?: string) => {
    if (!user) return null

    try {
      const newTitle = title || `Conversación ${new Date().toLocaleDateString()}`
      
      const { data: conversationData, error } = await supabase
        .from('conversations')
        .insert({
          title: newTitle,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        return null
      }

      const newConversation: Conversation = {
        ...conversationData,
        messages: [],
        created_at: new Date(conversationData.created_at),
        updated_at: new Date(conversationData.updated_at)
      }

      setConversations(prev => [newConversation, ...prev])
      setCurrentConversation(newConversation)
      
      return newConversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }

  const sendMessage = async (content: string, selectedImage?: string) => {
    if (!user || !content.trim()) return

    // Crear conversación si no existe
    let conversation = currentConversation
    if (!conversation) {
      conversation = await createNewConversation()
      if (!conversation) return
    }

    setIsLoading(true)

    try {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      // Agregar mensaje del usuario
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date()
      }

      // Guardar mensaje del usuario en la base de datos
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        role: 'user',
        content,
        image_data: selectedImage
      })

      // Actualizar estado local
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, userMessage],
        updated_at: new Date()
      }
      
      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(c => c.id === conversation!.id ? updatedConversation : c)
      )

      // Llamar a la edge function chat-ai
      console.log('🧠 Sending message to CEREBRO chat-ai...')
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          useKnowledgeBase,
          imageData: selectedImage
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        throw new Error(`Error en CEREBRO: ${error.message}`)
      }

      if (!data) {
        throw new Error('No se recibió respuesta de CEREBRO')
      }

      const { response, sources, documentsFound, foundRelevantContent } = data
      
      console.log(`✅ CEREBRO response received - Used ${documentsFound || 0} documents`)

      // Crear mensaje del asistente
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources: sources?.length > 0 ? sources : undefined,
        knowledgeUsed: foundRelevantContent ? sources : undefined
      }

      // Guardar mensaje del asistente en la base de datos
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: response,
        attachments: foundRelevantContent ? {
          knowledge_sources: sources?.map((source: string) => ({ title: source }))
        } : null
      })

      // Agregar mensaje a la conversación
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updated_at: new Date()
      }
      
      setCurrentConversation(finalConversation)
      setConversations(prev => 
        prev.map(c => c.id === conversation!.id ? finalConversation : c)
      )

      // Actualizar título si es la primera interacción
      if (finalConversation.messages.length === 2) {
        const newTitle = content.length > 50 ? content.substring(0, 50) + '...' : content
        await supabase
          .from('conversations')
          .update({ title: newTitle })
          .eq('id', conversation.id)
      }

      if (foundRelevantContent && documentsFound > 0) {
        toast({
          title: "🧠 Respuesta enriquecida",
          description: `CEREBRO consultó ${documentsFound} documentos de la base de conocimiento`
        })
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Request aborted') {
        console.log('Request was aborted')
        return
      }
      
      console.error('Error sending message:', error)
      toast({
        title: "Error en CEREBRO",
        description: "No se pudo procesar el mensaje. Verifica tu conexión e intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase.from('conversations').delete().eq('id', conversationId)
      
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      if (currentConversation?.id === conversationId) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId)
        setCurrentConversation(remainingConversations[0] || null)
      }
      
      toast({
        title: "Conversación eliminada",
        description: "La conversación ha sido eliminada exitosamente"
      })
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación",
        variant: "destructive"
      })
    }
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return {
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
    stopGeneration,
    loadConversations
  }
}