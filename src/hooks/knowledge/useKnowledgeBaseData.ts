
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export const useKnowledgeBaseData = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch REAL knowledge base items
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching knowledge base items...')

      if (!user) {
        console.log('❌ No user authenticated')
        setItems([])
        return
      }
      
      // Simple query without complex RLS
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Knowledge base fetch error:', error)
        // Don't throw error, just set empty state
        console.log('📝 Setting empty knowledge base due to error')
        setItems([])
        setError(null) // Don't show error to user
        return
      }

      console.log('✅ Knowledge base loaded:', data?.length || 0, 'items')
      setItems(data || [])
      
      if ((data || []).length === 0) {
        console.log('📝 Knowledge base is empty - ready for new documents')
      }

    } catch (error) {
      console.error('Knowledge base error:', error)
      // Don't break the app, just set empty state
      setItems([])
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Always try to fetch, even without user for public viewing
    fetchItems()
  }, [user])

  return {
    items,
    setItems,
    isLoading,
    error,
    fetchItems
  }
}
