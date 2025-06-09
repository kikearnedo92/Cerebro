
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  isError?: boolean
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      console.log('💬 Processing message:', content)

      // Search knowledge base with better error handling
      let knowledgeResults: any[] = []
      try {
        console.log('🔍 Searching knowledge base...')
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('title, content, project, tags')
          .eq('active', true)
          .or(`title.ilike.%${content}%,content.ilike.%${content}%`)
          .limit(3)

        if (error) {
          console.error('Knowledge search error:', error)
        } else {
          knowledgeResults = data || []
          console.log('📚 Knowledge results found:', knowledgeResults.length)
        }
      } catch (searchError) {
        console.error('Knowledge search failed:', searchError)
      }

      // Build response based on knowledge base results
      const hasKnowledge = knowledgeResults.length > 0
      
      let aiResponse: string
      let sources: string[] = []

      if (hasKnowledge) {
        // Format knowledge base response
        const knowledgeText = knowledgeResults.map((item, index) => 
          `**${index + 1}. ${item.title}:**\n${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}`
        ).join('\n\n')

        aiResponse = `Basándome en la información de Retorna, te puedo ayudar con lo siguiente:\n\n${knowledgeText}\n\n¿Necesitas que profundice en algún aspecto específico?`
        sources = knowledgeResults.map(item => item.title)
      } else {
        aiResponse = `No encontré información específica sobre este tema en la base de conocimiento de Retorna.\n\nTe recomiendo:\n- Consultar con tu supervisor directo\n- Revisar la documentación interna correspondiente\n- Contactar al área específica relacionada con tu consulta\n\n¿Hay algo más específico sobre los procesos de Retorna en lo que pueda ayudarte?`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        sources
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track analytics
      try {
        await supabase
          .from('usage_analytics')
          .insert({
            user_id: user.id,
            query: content,
            sources_used: hasKnowledge ? knowledgeResults.map(item => ({ title: item.title, project: item.project })) : null,
            ai_provider: 'internal'
          })
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError)
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta de nuevo o contacta al administrador.`,
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu mensaje. Inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  return {
    messages,
    loading,
    sendMessage,
    clearMessages
  }
}
