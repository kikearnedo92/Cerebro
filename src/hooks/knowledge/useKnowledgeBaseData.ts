
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { KnowledgeBase } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export const useKnowledgeBaseData = () => {
  const [items, setItems] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isSuperAdmin, isAdmin } = useAuth()

  // Fetch REAL knowledge base items (NO fake data)
  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Fetching REAL knowledge base items...', { 
        user: !!user, 
        isSuperAdmin, 
        isAdmin 
      })

      if (!user) {
        console.log('❌ No user authenticated')
        setError('Usuario no autenticado')
        return
      }
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
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
      
      // Solo mostrar toast si no es un error de permisos esperado
      if (!errorMessage.includes('permission denied') && !errorMessage.includes('RLS')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Solo hacer fetch si el usuario está autenticado
    if (user) {
      fetchItems()
    } else {
      setIsLoading(false)
      setError('Usuario no autenticado')
    }
  }, [user, isSuperAdmin, isAdmin])

  return {
    items,
    setItems,
    isLoading,
    error,
    fetchItems
  }
}
