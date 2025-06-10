
import { supabase } from '@/integrations/supabase/client'

export const useKnowledgeBaseSearch = () => {
  // Search REAL knowledge base for AI context
  const searchKnowledgeBase = async (query: string) => {
    try {
      if (!query.trim()) return []

      console.log('🔍 Searching REAL knowledge base for:', query)

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('title, content, project')
        .eq('active', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3)

      if (error) {
        console.error('Knowledge base search error:', error)
        return []
      }

      console.log('📚 REAL Search results:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  return {
    searchKnowledgeBase
  }
}
