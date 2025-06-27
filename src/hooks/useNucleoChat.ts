
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface NucleoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documentsUsed?: number
  isError?: boolean
}

export const useNucleoChat = () => {
  const [messages, setMessages] = useState<NucleoMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true)
  const { user } = useAuth()

  const sendMessage = async (content: string, imageData?: string) => {
    if (!content.trim() || loading || !user) return

    const userMessage: NucleoMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      console.log('🚀 Sending message to NÚCLEO chat:', content)

      const { data, error } = await supabase.functions.invoke('nucleo-chat', {
        body: {
          message: content,
          useKnowledgeBase,
          imageData
        }
      })

      if (error) {
        console.error('❌ NÚCLEO Chat API Error:', error)
        throw new Error(error.message || 'Error conectando con NÚCLEO')
      }

      const assistantMessage: NucleoMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date(),
        documentsUsed: data.documentsUsed
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ NÚCLEO response received')

      if (useKnowledgeBase && data.documentsUsed > 0) {
        toast({
          title: "Base de conocimiento consultada",
          description: `Se consultaron ${data.documentsUsed} documentos de NÚCLEO`,
          duration: 3000
        })
      }

    } catch (error) {
      console.error('❌ NÚCLEO chat error:', error)
      
      const errorMessage: NucleoMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta de nuevo.`,
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Hubo un problema procesando tu mensaje en NÚCLEO.",
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
      description: "Conversación NÚCLEO reiniciada"
    })
  }

  const toggleKnowledgeBase = () => {
    setUseKnowledgeBase(!useKnowledgeBase)
    toast({
      title: "Modo cambiado",
      description: `${!useKnowledgeBase ? 'Usando base de conocimiento NÚCLEO' : 'Modo general OpenAI'}`
    })
  }

  return {
    messages,
    loading,
    useKnowledgeBase,
    sendMessage,
    clearMessages,
    toggleKnowledgeBase
  }
}
