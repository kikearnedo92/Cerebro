
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { useAuth } from '@/hooks/useAuth'

export const useKnowledgeBaseData = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching knowledge base items...')

      // Simple query without RLS complications
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Knowledge base fetch error:', error)
        setItems([])
        setError(null) // Don't show error to user
        return
      }

      console.log('✅ Knowledge base loaded:', data?.length || 0, 'items')
      setItems(data || [])
      
    } catch (error) {
      console.error('Knowledge base error:', error)
      setItems([])
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    setItems,
    isLoading,
    error,
    fetchItems
  }
}
