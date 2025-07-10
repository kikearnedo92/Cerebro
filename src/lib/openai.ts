
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export const createChatCompletion = async (messages: any[], fileContent?: string, knowledgeContext?: any[]) => {
  let systemPrompt = `Eres CEREBRO, la plataforma de conocimiento inteligente de Retorna (fintech de remesas).

Tu función es ayudar al equipo interno con información sobre:
- Atención al cliente y resolución de casos
- Investigaciones y análisis de mercado
- Políticas específicas por país (Chile, Colombia, España, Venezuela, Brasil, Perú)
- Procedimientos operativos internos
- Scripts de respuesta para diferentes situaciones
- Normativas y compliance
- Conocimiento organizacional y mejores prácticas

IDENTIDAD - CEREBRO:
- Eres la plataforma de conocimiento definitiva de Retorna
- Tu nombre es CEREBRO, no "Retorna AI"
- Tienes acceso a toda la base de conocimiento interna
- Eres experto en todos los procesos y políticas de Retorna
- Respondes de forma inteligente, precisa y útil

INSTRUCCIONES:
1. Responde de forma concisa pero completa
2. Mantén un tono profesional pero accesible
3. Si no tienes información suficiente, indica qué información específica necesitas
4. Para temas de ATC, sugiere scripts de respuesta cuando sea apropiado
5. Para research, proporciona contexto y metodología cuando esté disponible
6. SIEMPRE cita las fuentes cuando uses información específica de documentos
7. Si la información viene de la base de conocimiento, mencionalo claramente`

  // Agregar contexto de la base de conocimiento si está disponible
  if (knowledgeContext && knowledgeContext.length > 0) {
    systemPrompt += `\n\nCONTEXTO DE LA BASE DE CONOCIMIENTO:
${knowledgeContext.map((doc, index) => 
  `\n[DOCUMENTO ${index + 1}] ${doc.title} (Proyecto: ${doc.project})
Contenido: ${doc.content}
Fuente: ${doc.source}
Relevancia: ${Math.round(doc.relevance * 100)}%`
).join('\n')}`
  }

  // Agregar archivo adjunto si está disponible
  if (fileContent) {
    systemPrompt += `\n\nArchivo adjunto para analizar:\n${fileContent}`
  }

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    max_tokens: 2000,
    temperature: 0.3,
    stream: true
  })

  return completion
}

export { openai }
