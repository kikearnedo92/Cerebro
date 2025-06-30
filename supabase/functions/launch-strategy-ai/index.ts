
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userMessage, currentQuestion, answers, totalQuestions } = await req.json()
    
    console.log(`🧠 Processing launch strategy question ${currentQuestion + 1}/${totalQuestions}`)

    const systemPrompt = `Eres un experto en estrategia de lanzamiento (GTM) para productos SaaS B2B, especialmente para NÚCLEO - "El cerebro empresarial completo con IA".

NÚCLEO es una plataforma que combina:
- Knowledge repository inteligente
- Analytics avanzados con Amplitude 
- AutoDev para mejoras automáticas de productos
- Automation workflows con IA
- Launch strategy generator

Tu trabajo es hacer preguntas estratégicas y generar respuestas perspicaces que ayuden a crear una estrategia GTM sólida.

Responde de manera:
- Profesional pero conversacional
- Específica y actionable
- Enfocada en métricas y resultados
- Adaptada al contexto SaaS B2B

Usuario está respondiendo la pregunta ${currentQuestion + 1} de ${totalQuestions}.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Mi respuesta: ${userMessage}

Contexto de respuestas anteriores: ${JSON.stringify(answers, null, 2)}

Por favor responde de manera breve y perspicaz, reconociendo mi respuesta y preparándome para la siguiente pregunta si no es la última.` }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    console.log('✅ AI response generated for launch strategy')

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Launch strategy AI error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
