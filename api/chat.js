// Vercel Serverless Function — CEREBRO Chat API
// Calls Claude (Anthropic) with knowledge base context from Supabase

import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, useKnowledgeBase, imageData, history } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicApiKey) {
      return res.status(500).json({
        error: 'Anthropic API key not configured',
        response: 'El chat con IA no está configurado todavía. Configura ANTHROPIC_API_KEY en las variables de entorno de Vercel.'
      })
    }

    // Initialize Supabase (service role for server-side access)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    let relevantDocs = []
    let sources = []

    // Search knowledge base if enabled and Supabase is configured
    if (useKnowledgeBase && supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Try semantic search first
        const { data: searchResults, error: searchError } = await supabase.rpc('search_knowledge_semantic', {
          query_text: message,
          project_filter: null,
          active_only: true,
          match_count: 8
        })

        if (!searchError && searchResults?.length > 0) {
          relevantDocs = searchResults
        } else {
          // Fallback to recent docs
          const { data: recentDocs } = await supabase
            .from('knowledge_base')
            .select('id, title, content, project, file_type, created_at')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(3)

          if (recentDocs) {
            relevantDocs = recentDocs.map(doc => ({ ...doc, relevance_score: 0.3 }))
          }
        }

        sources = relevantDocs.map(doc => doc.title)
      } catch (error) {
        console.error('Knowledge base search error:', error)
      }
    }

    // Build system prompt
    let systemPrompt
    if (useKnowledgeBase && relevantDocs.length > 0) {
      const context = relevantDocs.map((doc, i) =>
        `**DOCUMENTO ${i + 1}: ${doc.title}** (${doc.project || 'General'}):\n${doc.content?.substring(0, 4000) || 'Sin contenido'}`
      ).join('\n\n---\n\n')

      systemPrompt = `Eres CEREBRO, la capa de contexto operacional de esta empresa. Tu trabajo es ayudar al equipo a encontrar y entender información que ya existe en su organización.

DOCUMENTOS DE LA BASE DE CONOCIMIENTO (extractos relevantes):
${context}

CÓMO RESPONDER:

1. **Lee TODOS los documentos antes de responder.** No te bases solo en el primero.

2. **Cita la fuente con el título exacto del documento** entre asteriscos cuando uses información: *Manual de Onboarding*, *Playbook de Customer Success*, etc.

3. **Si encuentras información parcial, dala con honestidad.** Por ejemplo: "El Playbook menciona que el SLA es 5 minutos en horario hábil. No detalla cómo se mide en horario nocturno." Es mejor responder con lo que sí sabes que decir "no tengo información".

4. **Solo di "no tengo información" cuando NINGÚN documento toque el tema.** Si el tema aparece pero falta detalle, dilo así: "Tengo info general sobre [X], pero los detalles específicos de [Y] no están en los documentos a los que tengo acceso."

5. **NUNCA inventes nombres, fechas, montos, políticas o procedimientos** que no estén textualmente en los documentos. Si dudas, prefiere admitir que no sabes.

6. **Tono:** profesional pero cercano. Español natural. Sin emojis excesivos (máximo 1 por respuesta y solo si aporta).

7. **Estructura las respuestas:**
   - Respuesta directa primero (1-2 oraciones)
   - Después detalle si es relevante
   - Cierra con la cita de la fuente

8. **NO ofrezcas alternativas como "contactar al equipo de X" a menos que el usuario lo pida explícitamente.** El usuario quiere la respuesta, no que lo redirijas.

9. **Si el usuario pregunta de forma vaga ("intenta de nuevo", "explica más", "y qué más?"), usa el contexto de la conversación previa** para entender de qué tema sigue hablando.`
    } else {
      systemPrompt = `Eres CEREBRO, la capa de contexto operacional de esta empresa. Actualmente la base de conocimiento NO está activada en esta conversación, así que solo puedes responder con conocimiento general.

INSTRUCCIONES:
1. Responde en español, con tono profesional pero cercano.
2. Si la pregunta requiere información específica de la empresa (datos, políticas, decisiones, métricas), pide al usuario que active el toggle "Usar base de conocimiento" arriba.
3. Para consultas generales de productividad, gestión, customer success o tech, responde con tu mejor conocimiento general — pero aclara que no es info específica de su empresa.`
    }

    // Build user content for Claude
    const userContent = []

    if (imageData) {
      const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
      if (matches) {
        userContent.push({
          type: 'image',
          source: { type: 'base64', media_type: matches[1], data: matches[2] }
        })
      }
    }

    userContent.push({ type: 'text', text: message })

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: systemPrompt,
        // Construir el array de messages combinando history previa + el nuevo mensaje del usuario.
        // Sanitizamos: solo aceptamos {role, content} con role 'user' o 'assistant'.
        messages: [
          ...(Array.isArray(history) ? history.filter(m =>
            m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim()
          ).map(m => ({ role: m.role, content: m.content })) : []),
          { role: 'user', content: userContent }
        ]
      }),
    })

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => null)
      console.error('Claude API error:', claudeResponse.status, errorData)
      throw new Error(`Claude API error ${claudeResponse.status}: ${JSON.stringify(errorData) || claudeResponse.statusText}`)
    }

    const data = await claudeResponse.json()
    const aiResponse = data.content?.[0]?.text

    if (!aiResponse) {
      throw new Error('No response from Claude')
    }

    // Set CORS headers on response
    res.setHeader('Access-Control-Allow-Origin', '*')

    return res.status(200).json({
      response: aiResponse,
      sources: sources.length > 0 ? sources : undefined,
      documentsFound: relevantDocs.length,
      foundRelevantContent: relevantDocs.length > 0,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.'
    })
  }
}
