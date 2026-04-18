// AI Chat Engine for Cerebro
// Will migrate to Claude API (Anthropic) via Supabase Edge Functions
// For now: client-side placeholder that returns helpful messages

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// System prompt template for Cerebro (used by Edge Function)
export const getSystemPrompt = (companyName?: string, knowledgeContext?: any[]) => {
  let prompt = `Eres CEREBRO, el asistente de conocimiento inteligente${companyName ? ` de ${companyName}` : ''}.

Tu función es ayudar al equipo con información basada en la base de conocimiento de la empresa:
- Responder preguntas sobre procesos y procedimientos internos
- Proporcionar información de documentos y wikis conectados
- Ayudar con búsquedas en herramientas integradas (Notion, Slack, Drive, etc.)
- Generar resúmenes y análisis basados en datos disponibles

IDENTIDAD:
- Tu nombre es CEREBRO
- Tienes acceso a toda la base de conocimiento conectada
- Respondes de forma inteligente, precisa y útil
- Si no tienes información, lo dices claramente

INSTRUCCIONES:
1. Responde de forma concisa pero completa
2. Mantén un tono profesional pero accesible
3. Cita las fuentes cuando uses información de documentos
4. Si la información viene de una integración, menciona cuál`

  if (knowledgeContext && knowledgeContext.length > 0) {
    prompt += `\n\nCONTEXTO DE LA BASE DE CONOCIMIENTO:
${knowledgeContext.map((doc, index) =>
  `\n[DOCUMENTO ${index + 1}] ${doc.title} (Proyecto: ${doc.project})
Contenido: ${doc.content}
Fuente: ${doc.source}
Relevancia: ${Math.round(doc.relevance * 100)}%`
).join('\n')}`
  }

  return prompt
}

// Placeholder chat completion (will be replaced by Claude API Edge Function)
export const createChatCompletion = async (messages: any[], fileContent?: string, knowledgeContext?: any[]) => {
  // TODO: Replace with Supabase Edge Function call to Claude API
  // const response = await supabase.functions.invoke('chat', { body: { messages, knowledgeContext } })

  console.warn('Chat API not yet configured. Connect Claude API via Supabase Edge Functions.')

  // Return a simulated async iterator for streaming compatibility
  return {
    [Symbol.asyncIterator]() {
      let done = false
      return {
        async next() {
          if (done) return { done: true, value: undefined }
          done = true
          return {
            done: false,
            value: {
              choices: [{
                delta: {
                  content: 'Para activar el chat con IA, configura tu API key de Claude (Anthropic) en las variables de entorno del proyecto. Ve a Configuración > API para más detalles.'
                }
              }]
            }
          }
        }
      }
    }
  }
}
