import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface SemanticSearchResult {
  id: string
  title: string
  content: string
  project: string
  tags: string[]
  file_type: string
  file_url: string
  created_at: string
  relevance_score: number
}

interface SearchStats {
  total_documents: number
  active_documents: number
  total_projects: number
  total_size_mb: number
  most_common_tags: string[]
}

export const useKnowledgeBaseSearch = () => {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([])
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null)

  const searchKnowledgeBase = async (
    query: string, 
    project?: string, 
    activeOnly: boolean = true,
    limit: number = 10
  ) => {
    if (!query.trim()) {
      setSearchResults([])
      return []
    }

    setIsSearching(true)
    try {
      console.log('🔍 Searching knowledge base:', { query, project, activeOnly, limit })

      const { data, error } = await supabase.rpc('search_knowledge_semantic', {
        query_text: query,
        project_filter: project || null,
        active_only: activeOnly,
        match_count: limit
      })

      if (error) {
        console.error('Search error:', error)
        return []
      }

      console.log(`✅ Found ${data?.length || 0} results`)
      setSearchResults(data || [])
      return data || []
      
    } catch (error) {
      console.error('Knowledge base search error:', error)
      return []
    } finally {
      setIsSearching(false)
    }
  }

  const getKnowledgeBaseStats = async () => {
    try {
      console.log('📊 Fetching knowledge base stats...')
      
      const { data, error } = await supabase.rpc('get_knowledge_base_stats')

      if (error) {
        console.error('Stats error:', error)
        return null
      }

      const stats = data?.[0] || null
      setSearchStats(stats)
      console.log('✅ Stats loaded:', stats)
      return stats
      
    } catch (error) {
      console.error('Knowledge base stats error:', error)
      return null
    }
  }

  // Función para búsqueda contextual inteligente para el chat
  const searchForContext = async (userQuery: string, limit: number = 3) => {
    setIsSearching(true)
    try {
      // Buscar documentos relevantes
      const results = await searchKnowledgeBase(userQuery, undefined, true, limit)
      
      // Formatear para el contexto del chat
      const contextDocuments = results.map(result => ({
        title: result.title,
        content: result.content.substring(0, 1000) + '...', // Limitar contenido
        project: result.project,
        relevance: result.relevance_score,
        source: result.file_url ? `[${result.title}](${result.file_url})` : result.title
      }))

      console.log(`🧠 Context search: Found ${contextDocuments.length} relevant documents`)
      return contextDocuments
      
    } catch (error) {
      console.error('Context search error:', error)
      return []
    } finally {
      setIsSearching(false)
    }
  }

  return {
    searchKnowledgeBase,
    searchForContext,
    getKnowledgeBaseStats,
    isSearching,
    searchResults,
    searchStats
  }
}