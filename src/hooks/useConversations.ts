
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export interface Conversation {
  id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources_used?: string[]
  rating?: number
}

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar conversaciones del usuario
  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  // Cargar mensajes de una conversación
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Crear nueva conversación
  const createConversation = async (title: string): Promise<Conversation | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      
      const newConversation = data as Conversation
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la conversación",
        variant: "destructive"
      })
      return null
    }
  }

  // Agregar mensaje a conversación
  const addMessage = async (conversationId: string, role: 'user' | 'assistant', content: string, sources?: string[]): Promise<Message | null> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role,
          content,
          attachments: sources ? { sources } : null
        })
        .select()
        .single()

      if (error) throw error
      
      const newMessage = data as Message
      setMessages(prev => [...prev, newMessage])

      // Actualizar timestamp de la conversación
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return newMessage
    } catch (error) {
      console.error('Error adding message:', error)
      return null
    }
  }

  // Seleccionar conversación
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    await fetchMessages(conversation.id)
  }

  // Nueva conversación
  const startNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    fetchConversations,
    createConversation,
    addMessage,
    selectConversation,
    startNewConversation,
    setMessages
  }
}
