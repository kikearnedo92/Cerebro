
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
    const { message, conversation_history } = await req.json()
    
    console.log('🤖 Claude direct chat request:', message)

    // En producción real, aquí conectarías con la API de Claude
    // Por ahora, simulamos respuestas inteligentes basadas en el contexto

    let response = ""
    let lovable_action = null

    // Analizar el mensaje para determinar la respuesta
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('analizar') || lowerMessage.includes('revisar')) {
      response = `Perfecto, voy a analizar tu solicitud: "${message}"\n\n📊 **Análisis inicial:**\n- He identificado el área de mejora\n- Revisando el código actual\n- Evaluando mejores prácticas\n\n¿Te gustaría que proceda con sugerencias específicas o prefieres que implemente mejoras directamente en Lovable?`
      
      lovable_action = {
        type: 'analysis',
        target: 'code_review',
        description: 'Análisis completo del código'
      }
    }
    
    else if (lowerMessage.includes('optimizar') || lowerMessage.includes('mejorar')) {
      response = `Excelente! Voy a optimizar según tu solicitud: "${message}"\n\n⚡ **Plan de optimización:**\n1. Identificar cuellos de botella\n2. Aplicar mejores prácticas\n3. Optimizar rendimiento\n4. Testing automático\n\n¿Quieres que ejecute estas optimizaciones en Lovable ahora?`
      
      lovable_action = {
        type: 'optimization',
        target: 'performance',
        description: 'Optimización automática de performance'
      }
    }
    
    else if (lowerMessage.includes('crear') || lowerMessage.includes('agregar')) {
      response = `¡Perfecto! Voy a crear lo que necesitas: "${message}"\n\n🔨 **Plan de desarrollo:**\n- Diseñar la arquitectura\n- Implementar funcionalidad\n- Agregar tests\n- Documentar cambios\n\n¿Procedo con la implementación en Lovable?`
      
      lovable_action = {
        type: 'create',
        target: 'new_feature',
        description: 'Creación de nueva funcionalidad'
      }
    }
    
    else if (lowerMessage.includes('error') || lowerMessage.includes('problema')) {
      response = `Entiendo que hay un problema. Permíteme ayudarte: "${message}"\n\n🔧 **Diagnóstico:**\n- Revisando logs y errores\n- Identificando causa raíz\n- Preparando solución\n\n¿Quieres que implemente la solución directamente?`
      
      lovable_action = {
        type: 'debug',
        target: 'error_fix',
        description: 'Corrección automática de errores'
      }
    }
    
    else {
      // Respuesta general inteligente
      response = `Entiendo tu solicitud: "${message}"\n\n🤔 **Mi análisis:**\nPuedo ayudarte con análisis de código, optimizaciones, nuevas funcionalidades, debugging, y mucho más.\n\n**¿Qué te gustaría que haga específicamente?**\n- Analizar performance\n- Crear nueva funcionalidad\n- Optimizar código existente\n- Resolver bugs\n- Mejorar UX/UI\n\nSolo dime qué necesitas y lo ejecutaré en Lovable automáticamente.`
    }

    console.log('✅ Claude response generated successfully')

    return new Response(
      JSON.stringify({ 
        response,
        lovable_action,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in claude-direct-chat:', error)
    return new Response(
      JSON.stringify({ 
        response: "Disculpa, tuve un problema técnico. ¿Puedes intentar de nuevo?",
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
