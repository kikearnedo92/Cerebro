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
    const { message, useKnowledgeBase, imageData } = req.body

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

      systemPrompt = `Eres CEREBRO, el asistente de conocimiento inteligente de la empresa.

DOCUMENTOS DE LA BASE DE CONOCIMIENTO:
${context}

TU ROL:
- Asistente interno con acceso a la documentación de la empresa
- Respuestas precisas basadas en documentos oficiales

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Usa PRIORITARIAMENTE la información de los documentos
3. Cita las fuentes: "Según el documento [Nombre]..."
4. Si no tienes información suficiente, indícalo claramente
5. Respuestas concisas pero completas`
    } else {
      systemPrompt = `Eres CEREBRO, el asistente de conocimiento inteligente de la empresa.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Tono profesional pero accesible
3. Ayuda con consultas generales de trabajo y productividad
4. Si necesitas información específica, sugiere activar la base de conocimiento`
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
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      }),
    })

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json().catch(() => null)
      console.error('Claude API error:', claudeResponse.status, errorData)
      throw new Error(`Claude API error: ${claudeResponse.statusText}`)
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
