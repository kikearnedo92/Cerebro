
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface Conversation {
  id: string
  title: string
  created_at: string
  user_id: string
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchConversations = async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      console.log('🔄 Fetching conversations for user:', user.id)
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Conversations fetch error:', error)
        setConversations([])
      } else {
        console.log('✅ Conversations loaded:', data?.length || 0)
        setConversations(data || [])
      }
    } catch (error) {
      console.error('❌ Conversations error:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (title: string): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update local state
      setConversations(prev => [data, ...prev])
      
      return data.id
    } catch (error) {
      console.error('❌ Error creating conversation:', error)
      throw error
    }
  }

  const updateConversationTitle = async (conversationId: string, title: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, title } : conv
      ))
    } catch (error) {
      console.error('❌ Error updating conversation title:', error)
      throw error
    }
  }

  useEffect(() => {
    if (user) {
      console.log('👤 User available, fetching conversations')
      fetchConversations()
    } else {
      console.log('👤 No user, clearing conversations')
      setConversations([])
      setLoading(false)
    }
  }, [user])

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    updateConversationTitle
  }
}
