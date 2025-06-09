
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { createChatCompletion } from '@/lib/openai'

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
      console.log('💬 Processing REAL message:', content)

      // Search REAL knowledge base
      const knowledgeResults = await searchKnowledgeBase(content)
      console.log('📚 REAL Knowledge results:', knowledgeResults.length)

      // Create context from REAL knowledge base
      let context = ''
      let sources: string[] = []
      
      if (knowledgeResults.length > 0) {
        context = knowledgeResults.map(item => 
          `**${item.title}** (${item.project}):\n${item.content}`
        ).join('\n\n---\n\n')
        sources = knowledgeResults.map(item => item.title)
      }

      // REAL OpenAI API call
      try {
        console.log('🤖 Making REAL OpenAI API call...')
        
        const messages = [
          {
            role: 'system' as const,
            content: `Eres Cerebro, el asistente de IA de Retorna (empresa fintech de remesas). 

CONTEXTO DE DOCUMENTOS REALES:
${context || 'No se encontraron documentos relevantes en la base de conocimiento.'}

INSTRUCCIONES:
- Responde SOLO en español
- Sé conciso pero completo
- Si tienes información específica de los documentos de Retorna, úsala
- Si no tienes información específica, di que necesitas más detalles
- Mantén un tono profesional pero amigable
- Si te preguntan algo fuera del ámbito de Retorna, redirige la conversación`
          },
          {
            role: 'user' as const,
            content: content
          }
        ]

        const completion = await createChatCompletion(messages)
        
        let aiResponse = ''
        
        // Process streaming response
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || ''
          aiResponse += delta
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          sources: sources.length > 0 ? sources : undefined
        }

        setMessages(prev => [...prev, assistantMessage])

        // Track REAL analytics
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
              response_time: 1500 // Real response time would be calculated
            })
        } catch (analyticsError) {
          console.error('Analytics tracking failed:', analyticsError)
        }

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        
        // Fallback response when OpenAI fails
        let fallbackResponse: string
        
        if (knowledgeResults.length > 0) {
          fallbackResponse = `Encontré información relevante en estos documentos:\n\n${knowledgeResults.map((item, index) => 
            `**${index + 1}. ${item.title}:**\n${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}`
          ).join('\n\n')}\n\n*Nota: Servicio de IA temporalmente no disponible. Mostrando información de documentos.*`
        } else {
          fallbackResponse = `No encontré información específica sobre "${content}" en la base de conocimiento de Retorna.\n\n*Nota: Servicio de IA temporalmente no disponible.*\n\nTe recomiendo:\n• Consultar con tu supervisor directo\n• Revisar la documentación interna\n• Contactar al área específica relacionada`
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
          sources: sources.length > 0 ? sources : undefined
        }

        setMessages(prev => [...prev, assistantMessage])
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
