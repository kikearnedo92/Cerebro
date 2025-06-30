
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
    const { request } = await req.json()
    
    console.log('🧠 Claude analyzing development request:', request)

    const systemPrompt = `Eres un Senior Software Architect especializado en aplicaciones web modernas. Tu trabajo es analizar solicitudes de desarrollo y crear especificaciones técnicas detalladas para implementación.

Contexto: Estás trabajando en NÚCLEO, una plataforma SaaS que incluye:
- React + TypeScript + Tailwind CSS + Shadcn UI
- Supabase como backend
- Amplitude para analytics
- Integración con APIs externas

Para cada solicitud, genera:
1. **Análisis del Problema**: Identifica el problema específico
2. **Solución Técnica**: Describe la implementación
3. **Componentes Requeridos**: Lista archivos/componentes a crear/modificar
4. **APIs Necesarias**: Endpoints o integraciones requeridas
5. **Consideraciones UX**: Mejoras de experiencia de usuario
6. **Métricas de Éxito**: Cómo medir el impacto

Formato: JSON estructurado con campos claros.`

    const userPrompt = `Analiza esta solicitud de desarrollo: "${request}"

Genera una especificación técnica completa en formato JSON con la estructura:
{
  "problem_analysis": "...",
  "technical_solution": "...",
  "required_components": ["...", "..."],
  "api_requirements": ["...", "..."],
  "ux_considerations": ["...", "..."],
  "success_metrics": ["...", "..."],
  "implementation_priority": "high|medium|low",
  "estimated_effort": "1-2 hours|3-5 hours|1-2 days",
  "risk_assessment": "low|medium|high"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('ANTHROPIC_API_KEY')}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${await response.text()}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Extract JSON from Claude's response
    let specification
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        specification = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback specification if parsing fails
      console.log('⚠️ JSON parsing failed, creating fallback specification')
      specification = {
        problem_analysis: `Análisis de: ${request}`,
        technical_solution: "Implementación requerida usando React + TypeScript",
        required_components: ["ComponenteNuevo.tsx", "hooks/useNuevaFuncionalidad.ts"],
        api_requirements: ["Supabase edge function", "Frontend integration"],
        ux_considerations: ["Responsive design", "Loading states", "Error handling"],
        success_metrics: ["User engagement", "Conversion rate", "Performance metrics"],
        implementation_priority: "high",
        estimated_effort: "3-5 hours",
        risk_assessment: "low"
      }
    }

    console.log('✅ Claude specification generated successfully')

    return new Response(
      JSON.stringify({ 
        specification,
        raw_analysis: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Claude analysis failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
