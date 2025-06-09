
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase'
import { toast } from '@/hooks/use-toast'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
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
      // 1. Search knowledge base for relevant content
      const knowledgeResults = await searchKnowledgeBase(content)
      
      // 2. Build enhanced prompt with knowledge base content
      const contextPrompt = knowledgeResults && knowledgeResults.length > 0 
        ? `INFORMACIÓN ESPECÍFICA DE RETORNA:
${knowledgeResults.map(item => `
Fuente: ${item.title}
Proyecto: ${item.project}
Contenido: ${item.content}
`).join('\n')}

PREGUNTA DEL USUARIO: ${content}

Instrucciones:
- Responde PRIORITARIAMENTE usando la información específica de Retorna proporcionada arriba
- Si no hay información relevante en las fuentes, indica que no tienes datos específicos sobre ese tema
- Siempre menciona las fuentes utilizadas al final de tu respuesta
- Sé conciso pero completo
- Mantén un tono profesional y útil`
        : `PREGUNTA DEL USUARIO: ${content}

Como Cerebro, el asistente de Retorna, no tengo información específica sobre este tema en mi base de conocimiento actual. Te recomiendo consultar con tu supervisor o revisar la documentación interna correspondiente.`

      // 3. Simulate AI response (replace with actual AI call)
      const aiResponse = await generateAIResponse(contextPrompt, knowledgeResults)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        sources: aiResponse.sources
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
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

// Mock AI response generation (replace with actual OpenAI integration)
const generateAIResponse = async (prompt: string, knowledgeResults: any[]) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  const hasKnowledge = knowledgeResults && knowledgeResults.length > 0
  
  if (hasKnowledge) {
    return {
      content: `Basándome en la información de Retorna, te puedo ayudar con lo siguiente:

${knowledgeResults.map((item, index) => `
**${index + 1}. Información de ${item.title}:**
${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}
`).join('\n')}

¿Necesitas que profundice en algún aspecto específico?`,
      sources: knowledgeResults.map(item => item.title)
    }
  } else {
    return {
      content: `No encontré información específica sobre este tema en la base de conocimiento de Retorna. 

Te recomiendo:
- Consultar con tu supervisor directo
- Revisar la documentación interna correspondiente
- Contactar al área específica relacionada con tu consulta

¿Hay algo más específico sobre los procesos de Retorna en lo que pueda ayudarte?`,
      sources: []
    }
  }
}
