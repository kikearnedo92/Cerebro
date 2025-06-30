
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
    const { description } = await req.json()
    
    console.log('🤖 Generating N8N workflow from description:', description)

    const systemPrompt = `Eres un experto en automatización con N8N. Tu trabajo es convertir descripciones en lenguaje natural en workflows N8N completos y ejecutables.

Para cada descripción, genera:
1. **Nombre del workflow**: Descriptivo y claro
2. **Descripción**: Resumen de lo que hace
3. **Nodos del workflow**: Secuencia de pasos con configuración específica

Tipos de nodos disponibles:
- trigger: Eventos que inician el workflow (webhook, schedule, manual)
- condition: Evaluación de condiciones (if/else, switch)
- action: Acciones a ejecutar (email, HTTP request, database update)
- delay: Esperas temporales

Formato: JSON estructurado con configuración detallada para cada nodo.`

    const userPrompt = `Convierte esta descripción en un workflow N8N completo: "${description}"

Genera un JSON con la estructura:
{
  "name": "Nombre descriptivo",
  "description": "Descripción clara",
  "nodes": [
    {
      "id": "node1",
      "type": "trigger|condition|action|delay",
      "title": "Título del nodo",
      "description": "Descripción del paso",
      "config": {
        // Configuración específica del nodo
      }
    }
  ]
}`

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Extract JSON from response
    let workflow
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        workflow = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback workflow if parsing fails
      console.log('⚠️ JSON parsing failed, creating fallback workflow')
      workflow = {
        name: "Automatización personalizada",
        description: description,
        nodes: [
          {
            id: "trigger1",
            type: "trigger",
            title: "Evento inicial",
            description: "Detecta cuando ocurre la condición especificada",
            config: { type: "webhook", method: "POST" }
          },
          {
            id: "condition1",
            type: "condition",
            title: "Evaluar condición",
            description: "Verifica si se cumple la condición para continuar",
            config: { operator: "equals", value: "true" }
          },
          {
            id: "action1",
            type: "action",
            title: "Ejecutar acción",
            description: "Realiza la acción especificada en la descripción",
            config: { type: "email", template: "default" }
          }
        ]
      }
    }

    console.log('✅ N8N workflow generated successfully')

    return new Response(
      JSON.stringify({ workflow }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ N8N workflow generation failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
