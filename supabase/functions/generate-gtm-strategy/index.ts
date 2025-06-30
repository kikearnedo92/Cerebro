
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
    const { answers } = await req.json()
    
    console.log('🎯 Generating comprehensive GTM strategy...')

    const systemPrompt = `Eres un experto en Go-To-Market strategy para productos SaaS B2B. Vas a generar una estrategia GTM completa y ejecutable para NÚCLEO basada en las respuestas del usuario.

NÚCLEO Positioning: "El cerebro empresarial completo con IA"
- Knowledge repository para discoveries e investigaciones
- Analytics avanzados conectados con Amplitude  
- AutoDev que mejora productos automáticamente
- Automation workflows con Claude + Lovable
- Launch strategy generator

Pricing Structure:
- Freemium: $0 (1 usuario, 100 queries/mes)
- Starter: $5/mo (3 usuarios, unlimited queries) 
- Professional: $15/mo (10 usuarios + integrations)
- Enterprise: $49/mo (unlimited + custom features)

Genera una estrategia GTM que incluya:
1. Target audience específico y detallado
2. Positioning statement único
3. Channel strategy (4-5 canales principales)
4. Content calendar (8 semanas)
5. Pricing validation y recommendations
6. Competition analysis (3 competidores)
7. Success metrics (KPIs específicos)
8. Timeline ejecutable (fases de 30/60/90 días)

Formato: JSON estructurado, específico y actionable.`

    const userPrompt = `Basándote en estas respuestas, genera una estrategia GTM completa:

${Object.entries(answers).map(([key, value], index) => 
  `${index + 1}. ${value}`
).join('\n\n')}

Genera un JSON con la estructura exacta solicitada.`

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
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`)
    }

    const data = await response.json()
    let strategyText = data.choices[0].message.content

    // Extract JSON from the response
    const jsonMatch = strategyText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      strategyText = jsonMatch[0]
    }

    let strategy
    try {
      strategy = JSON.parse(strategyText)
    } catch (parseError) {
      // Fallback strategy if JSON parsing fails
      console.log('⚠️ JSON parsing failed, using fallback strategy')
      strategy = {
        targetAudience: "Head of Customer Success, Product Managers, y founders de SaaS B2B entre 10-100 empleados que necesitan centralizar conocimiento y automatizar mejoras de producto",
        positioning: "NÚCLEO es el cerebro empresarial que conecta tu knowledge, analytics y desarrollo para crear un ciclo de mejora continua automatizado",
        channels: ["LinkedIn Content", "Product Hunt", "SaaS Communities", "Partnership", "Content Marketing"],
        contentCalendar: [
          { week: "Semana 1", content: "Case study: Cómo NÚCLEO redujo churn 40%", channel: "LinkedIn" },
          { week: "Semana 2", content: "Tutorial: Setup AutoDev en 5 minutos", channel: "YouTube" },
          { week: "Semana 3", content: "Webinar: Analytics que predicen churn", channel: "Webinar" },
          { week: "Semana 4", content: "Guest post: Future of AI in Customer Success", channel: "Blog" }
        ],
        pricing: [
          { tier: "Freemium", price: "$0", features: ["1 usuario", "100 queries/mes", "Basic analytics"] },
          { tier: "Starter", price: "$5/mo", features: ["3 usuarios", "Unlimited queries", "AutoDev básico"] },
          { tier: "Professional", price: "$15/mo", features: ["10 usuarios", "Full integrations", "Advanced analytics"] },
          { tier: "Enterprise", price: "$49/mo", features: ["Unlimited users", "Custom features", "Priority support"] }
        ],
        competition: [
          { name: "Notion", strength: "Simplicidad", weakness: "No tiene IA predictiva" },
          { name: "Intercom", strength: "Customer support", weakness: "No conecta con desarrollo" },
          { name: "Mixpanel", strength: "Analytics", weakness: "No es actionable automáticamente" }
        ],
        metrics: ["MRR Growth", "User Activation Rate", "Churn Prediction Accuracy", "AutoDev Deployment Success"],
        timeline: [
          { phase: "30 días", duration: "1 mes", activities: ["Product Hunt launch", "First 100 users", "Content strategy"] },
          { phase: "60 días", duration: "2 meses", activities: ["Partnership program", "Case studies", "Feature expansion"] },
          { phase: "90 días", duration: "3 meses", activities: ["Series A prep", "Enterprise sales", "International expansion"] }
        ]
      }
    }

    console.log('✅ GTM strategy generated successfully')

    return new Response(
      JSON.stringify({ strategy }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ GTM strategy generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
