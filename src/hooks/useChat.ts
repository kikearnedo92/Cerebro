
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

export type ChatMode = 'knowledge' | 'general'

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('knowledge')
  const { user } = useAuth()

  // For backward compatibility with ConversationalChatInterface
  const useKnowledgeBase = chatMode === 'knowledge'

  const sendMessage = async (content: string, imageData?: string) => {
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
      console.log('🚀 Sending message to CEREBRO chat:', content)

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          useKnowledgeBase: useKnowledgeBase,
          imageData
        }
      })

      if (error) {
        console.error('❌ CEREBRO Chat API Error:', error)
        throw new Error(error.message || 'Error conectando con CEREBRO')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Lo siento, no pude procesar tu solicitud.',
        timestamp: new Date(),
        sources: data.sources
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ CEREBRO response received')

      if (useKnowledgeBase && data.sources && data.sources.length > 0) {
        toast({
          title: "Base de conocimiento consultada",
          description: `Se consultaron ${data.sources.length} documentos`,
          duration: 3000
        })
      }

    } catch (error) {
      console.error('❌ CEREBRO chat error:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta de nuevo.`,
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Hubo un problema procesando tu mensaje.",
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
      description: "Conversación reiniciada"
    })
  }

  const toggleChatMode = () => {
    const newMode = chatMode === 'knowledge' ? 'general' : 'knowledge'
    setChatMode(newMode)
    toast({
      title: "Modo cambiado",
      description: `${newMode === 'knowledge' ? 'Usando base de conocimiento' : 'Modo general OpenAI'}`
    })
  }

  // For backward compatibility
  const toggleKnowledgeBase = toggleChatMode

  return {
    messages,
    loading,
    chatMode,
    useKnowledgeBase,
    sendMessage,
    clearMessages,
    toggleChatMode,
    toggleKnowledgeBase
  }
}
