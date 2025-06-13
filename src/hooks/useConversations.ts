
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface Conversation {
  id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
}

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      setConversations(data || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (title?: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: title || 'Nueva conversación',
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Refresh conversations list
    await fetchConversations()

    return data.id
  }

  const updateConversationTitle = async (conversationId: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) {
      throw error
    }

    // Update local state
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title, updated_at: new Date().toISOString() }
          : conv
      )
    )
  }

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      throw error
    }

    // Update local state
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
  }

  const refreshConversations = () => {
    return fetchConversations()
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    refreshConversations
  }
}
