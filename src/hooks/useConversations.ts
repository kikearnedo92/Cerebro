
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchConversations = async () => {
    if (!user) {
      console.log('No user found, skipping conversations fetch')
      return
    }

    setLoading(true)
    try {
      console.log('🔄 Fetching conversations for user:', user.id)
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching conversations:', error)
        throw error
      }

      console.log('✅ Conversations loaded:', data?.length || 0)
      setConversations(data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (title?: string): Promise<string> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('📝 Creating new conversation...')
    
    const newTitle = title || `Conversación ${new Date().toLocaleString()}`
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: newTitle,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating conversation:', error)
      throw error
    }

    console.log('✅ Conversation created:', data.id)
    await fetchConversations() // Refresh the list
    return data.id
  }

  const updateConversationTitle = async (conversationId: string, title: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('📝 Updating conversation title:', conversationId, title)
    
    const { error } = await supabase
      .from('conversations')
      .update({ 
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error updating conversation title:', error)
      throw error
    }

    console.log('✅ Conversation title updated')
    await fetchConversations() // Refresh the list
  }

  const refreshConversations = async () => {
    await fetchConversations()
  }

  useEffect(() => {
    if (user) {
      console.log('👤 User available, fetching conversations')
      fetchConversations()
    } else {
      console.log('👤 No user, clearing conversations')
      setConversations([])
    }
  }, [user])

  return {
    conversations,
    loading,
    createConversation,
    updateConversationTitle,
    refreshConversations
  }
}
