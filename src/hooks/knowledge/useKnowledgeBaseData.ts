
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'

export const useKnowledgeBaseData = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch REAL knowledge base items (NO fake data)
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching REAL knowledge base items...')
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Knowledge base fetch error:', error)
        throw new Error(`Error cargando knowledge base: ${error.message}`)
      }

      console.log('✅ REAL Knowledge base loaded:', data?.length || 0, 'items')
      setItems(data || [])
      
      // REAL empty state - no fake data
      if ((data || []).length === 0) {
        console.log('📝 Knowledge base is empty - ready for REAL documents')
      }

    } catch (error) {
      console.error('Knowledge base error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
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
