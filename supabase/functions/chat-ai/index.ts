
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, useKnowledgeBase, imageData } = await req.json();

    console.log(`🧠 Processing CEREBRO chat message:`, message);
    console.log(`📚 Using knowledge base:`, useKnowledgeBase);

    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY in Supabase secrets.');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let relevantDocs: any[] = [];
    let sources: string[] = [];
    let systemPrompt = '';

    if (useKnowledgeBase) {
      try {
        console.log('🔍 Searching knowledge base...');

        // Semantic search
        const { data: searchResults, error: searchError } = await supabase.rpc('search_knowledge_semantic', {
          query_text: message,
          project_filter: null,
          active_only: true,
          match_count: 8
        });

        if (searchError) {
          console.error('Semantic search error:', searchError);
          // Fallback to simple query
          const { data: fallbackDocs, error: fallbackError } = await supabase
            .from('knowledge_base')
            .select('id, title, content, project, file_type, created_at')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(5);

          if (!fallbackError && fallbackDocs) {
            relevantDocs = fallbackDocs.map(doc => ({ ...doc, relevance_score: 0.5 }));
          }
        } else if (searchResults && searchResults.length > 0) {
          relevantDocs = searchResults;
          console.log(`📊 Found ${relevantDocs.length} relevant documents`);
        } else {
          console.log('📄 No semantic matches, fetching recent documents');
          const { data: recentDocs, error: recentError } = await supabase
            .from('knowledge_base')
            .select('id, title, content, project, file_type, created_at')
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(3);

          if (!recentError && recentDocs) {
            relevantDocs = recentDocs.map(doc => ({ ...doc, relevance_score: 0.3 }));
          }
        }

        relevantDocs.forEach((doc, index) => {
          console.log(`📄 Doc ${index + 1}: "${doc.title}" (relevance: ${doc.relevance_score?.toFixed(3) || 'N/A'})`);
        });

      } catch (error) {
        console.error('Knowledge base search error:', error);
      }

      // Build context from documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map((doc, index) =>
          `**DOCUMENTO ${index + 1}: ${doc.title}** (${doc.project || 'General'} - Relevancia: ${doc.relevance_score?.toFixed(3) || 'N/A'}):\n${doc.content?.substring(0, 4000) || 'Sin contenido'}${doc.content?.length > 4000 ? '\n[... contenido truncado]' : ''}`
        ).join('\n\n---\n\n');

        sources = relevantDocs.map(doc => doc.title);
      }

      systemPrompt = `Eres CEREBRO, el asistente de conocimiento inteligente de la empresa.

DOCUMENTOS DE LA BASE DE CONOCIMIENTO:
${context || 'No se encontraron documentos relevantes para esta consulta.'}

ESTADÍSTICAS:
- Documentos encontrados: ${relevantDocs.length}
- Fuentes: ${sources.length > 0 ? sources.join(', ') : 'Ninguna'}

TU ROL:
- Asistente interno con acceso a la documentación de la empresa
- Ayudas con procedimientos, políticas, información técnica y operativa
- Respuestas precisas basadas en documentos oficiales

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Usa PRIORITARIAMENTE la información de los documentos disponibles
3. Cita las fuentes: "Según el documento [Nombre]..."
4. Si no tienes información suficiente, indícalo claramente
5. Respuestas concisas pero completas
6. Sugiere próximos pasos cuando sea relevante`;

    } else {
      systemPrompt = `Eres CEREBRO, el asistente de conocimiento inteligente de la empresa. No estás consultando la base de conocimiento en esta consulta.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Tono profesional pero accesible
3. Ayuda con consultas generales de trabajo y productividad
4. Si necesitas información específica de la empresa, sugiere activar la base de conocimiento`;
    }

    // Build messages for Claude API
    const userContent: any[] = [];

    if (imageData) {
      // Extract base64 data and media type from data URL
      const matches = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        userContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: matches[1],
            data: matches[2]
          }
        });
      }
    }

    userContent.push({ type: 'text', text: message });

    // Call Claude API (Anthropic)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        messages: [
          { role: 'user', content: userContent }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Claude');
    }

    console.log('✅ CEREBRO response generated via Claude API');
    console.log(`📊 Used ${relevantDocs.length} documents from knowledge base`);

    // Log analytics
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          query: message,
          sources_used: relevantDocs.length > 0 ? relevantDocs.map(doc => ({
            title: doc.title,
            project: doc.project || 'General',
            file_type: doc.file_type || 'unknown',
            relevance_score: doc.relevance_score || 0
          })) : null,
          ai_provider: 'anthropic',
          response_time: 2000,
          found_relevant_content: relevantDocs.length > 0
        });
    } catch (analyticsError) {
      console.error('Analytics logging failed:', analyticsError);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      sources: sources.length > 0 ? sources : undefined,
      documentsFound: relevantDocs.length,
      foundRelevantContent: relevantDocs.length > 0,
      searchStats: {
        totalDocuments: relevantDocs.length,
        usedKnowledgeBase: useKnowledgeBase,
        semanticSearch: true,
        averageRelevance: relevantDocs.length > 0 ?
          (relevantDocs.reduce((sum, doc) => sum + (doc.relevance_score || 0), 0) / relevantDocs.length).toFixed(3) : 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in CEREBRO chat-ai:', error);
    return new Response(JSON.stringify({
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
