
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
  foundRelevantContent?: boolean
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
      console.log('💬 Sending message to REAL AI with vector search:', content)

      // Call the enhanced chat-ai edge function
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: content,
          userId: user.id
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources?.length > 0 ? data.sources : undefined,
        foundRelevantContent: data.foundRelevantContent
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ REAL AI response with vector search received')

      // Show info if no relevant content was found
      if (!data.foundRelevantContent) {
        toast({
          title: "Información",
          description: "No se encontró contenido específico en la base de conocimiento. La respuesta se basa en el conocimiento general de CEREBRO.",
          variant: "default"
        })
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
