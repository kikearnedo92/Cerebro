
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
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
  const { searchKnowledgeBase } = useKnowledgeBase()

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

      // Search knowledge base
      const knowledgeResults = await searchKnowledgeBase(content)
      console.log('📚 Knowledge results:', knowledgeResults.length)

      // Create context from knowledge base
      let context = ''
      let sources: string[] = []
      
      if (knowledgeResults.length > 0) {
        context = knowledgeResults.map(item => 
          `**${item.title}** (${item.project}):\n${item.content}`
        ).join('\n\n---\n\n')
        sources = knowledgeResults.map(item => item.title)
      }

      // Generate AI response using OpenAI API
      const systemPrompt = `Eres Cerebro, el asistente de IA de Retorna. Tu función es ayudar a los empleados con información sobre procesos, políticas y procedimientos de la empresa.

CONTEXTO DE RETORNA:
${context || 'No se encontró información específica en la base de conocimiento.'}

INSTRUCCIONES:
- Responde SOLO en español
- Sé conciso pero completo
- Si tienes información específica de Retorna, úsala
- Si no tienes información específica, di que necesitas más detalles
- Mantén un tono profesional pero amigable
- Si te preguntan algo fuera del ámbito de Retorna, redirige la conversación`

      // For now, we'll create a mock response since we need OpenAI API key
      let aiResponse: string
      
      if (knowledgeResults.length > 0) {
        aiResponse = `Basándome en la información de Retorna, puedo ayudarte con lo siguiente:\n\n${knowledgeResults.map((item, index) => 
          `**${index + 1}. ${item.title}:**\n${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}`
        ).join('\n\n')}\n\n¿Te gustaría que profundice en algún aspecto específico?`
      } else {
        aiResponse = `No encontré información específica sobre "${content}" en la base de conocimiento de Retorna.\n\nTe recomiendo:\n• Consultar con tu supervisor directo\n• Revisar la documentación interna\n• Contactar al área específica relacionada\n\n¿Hay algo más específico sobre los procesos de Retorna en lo que pueda ayudarte?`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        sources: sources.length > 0 ? sources : undefined
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track analytics
      try {
        await supabase
          .from('usage_analytics')
          .insert({
            user_id: user.id,
            query: content,
            sources_used: knowledgeResults.length > 0 ? knowledgeResults.map(item => ({ 
              title: item.title, 
              project: item.project 
            })) : null,
            ai_provider: 'openai',
            response_time: 1200 // Mock response time
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
    toast({
      title: "Nueva conversación",
      description: "La conversación ha sido reiniciada"
    })
  }

  return {
    messages,
    loading,
    sendMessage,
    clearMessages
  }
}
