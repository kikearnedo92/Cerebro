
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export const createChatCompletion = async (messages: any[], fileContent?: string) => {
  const systemPrompt = `Eres Retorna AI, el asistente inteligente interno de Retorna (fintech de remesas).

Tu función es ayudar al equipo interno con información sobre:
- Atención al cliente y resolución de casos
- Investigaciones y análisis de mercado
- Políticas específicas por país (Chile, Colombia, España, Venezuela, Brasil, Perú)
- Procedimientos operativos internos
- Scripts de respuesta para diferentes situaciones
- Normativas y compliance

INSTRUCCIONES:
1. Responde de forma concisa pero completa
2. Mantén un tono profesional pero accesible
3. Si no tienes información suficiente, indica qué información específica necesitas
4. Para temas de ATC, sugiere scripts de respuesta cuando sea apropiado
5. Para research, proporciona contexto y metodología cuando esté disponible

${fileContent ? `\nArchivo adjunto para analizar:\n${fileContent}` : ''}`

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    max_tokens: 1500,
    temperature: 0.3,
    stream: true
  })

  return completion
}

export { openai }
