
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    
    console.log(`🤖 Processing CEREBRO chat message:`, message);
    console.log(`📚 Using knowledge base:`, useKnowledgeBase);
    
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let relevantDocs: any[] = [];
    let sources: string[] = [];
    let systemPrompt = '';
    
    if (useKnowledgeBase) {
      try {
        console.log('🔍 Searching CEREBRO knowledge base with semantic search...');
        
        // Use the new semantic search function
        const { data: searchResults, error: searchError } = await supabase.rpc('search_knowledge_semantic', {
          query_text: message,
          project_filter: null,
          active_only: true,
          match_count: 8
        });

        if (searchError) {
          console.error('Semantic search error:', searchError);
          // Fallback to simple query if semantic search fails
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
          console.log(`📊 Semantic search found ${relevantDocs.length} relevant documents`);
        } else {
          console.log('📄 No semantic matches found, fetching recent documents');
          // Fallback to recent docs if no semantic matches
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
        
        // Log selected documents with relevance scores
        relevantDocs.forEach((doc, index) => {
          console.log(`📄 Doc ${index + 1}: "${doc.title}" (relevance: ${doc.relevance_score?.toFixed(3) || 'N/A'}) - ${doc.content?.length || 0} chars`);
        });
        
      } catch (error) {
        console.error('CEREBRO knowledge base search error:', error);
      }

      // Build enhanced context from relevant documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map((doc, index) => 
          `**DOCUMENTO ${index + 1}: ${doc.title}** (${doc.project || 'General'} - ${doc.file_type || 'documento'} - Relevancia: ${doc.relevance_score?.toFixed(3) || 'N/A'}):\n${doc.content?.substring(0, 4000) || 'Sin contenido'}${doc.content?.length > 4000 ? '\n[... contenido truncado]' : ''}`
        ).join('\n\n' + '='.repeat(80) + '\n\n');
        
        sources = relevantDocs.map(doc => doc.title);
      }

      // Enhanced system prompt for CEREBRO with better search context
      systemPrompt = `Eres CEREBRO, el asistente inteligente especializado en el conocimiento interno de Retorna.

INFORMACIÓN CONTEXTUAL DISPONIBLE:
${context || 'No se encontraron documentos específicamente relevantes en la base de conocimiento para esta consulta.'}

ESTADÍSTICAS DE BÚSQUEDA:
- Documentos encontrados con búsqueda semántica: ${relevantDocs.length}
- Fuentes consultadas: ${sources.length > 0 ? sources.join(', ') : 'Ninguna específica'}
- Método de búsqueda: ${relevantDocs.some(d => d.relevance_score > 0.5) ? 'Semántica exitosa' : 'Fallback a documentos recientes'}

TU ROL Y RESPONSABILIDADES:
- Eres el asistente interno de Retorna con acceso completo a la documentación empresarial
- Ayudas a empleados con procedimientos, políticas, información técnica y operativa
- Proporcionas respuestas precisas basadas en documentos oficiales de la empresa
- Mantienes un tono profesional pero cercano y accesible

INSTRUCCIONES DE RESPUESTA:
1. Responde SIEMPRE en español
2. Usa PRIORITARIAMENTE la información de los documentos disponibles arriba
3. Si tienes información específica de documentos, cítala claramente mencionando el nombre del documento
4. Si no tienes información suficiente en los documentos, indícalo claramente y sugiere contactar al área correspondiente
5. Mantén respuestas concisas pero completas
6. Sugiere próximos pasos cuando sea relevante
7. SIEMPRE menciona las fuentes específicas cuando uses información de los documentos
8. Si la información está desactualizada o no es completa, hazlo saber

FORMATO DE RESPUESTA:
- Respuesta directa y útil basada en los documentos
- Cita de fuentes: "Según el documento [Nombre del documento]..."
- Si consultaste múltiples documentos, menciona cuántos y su relevancia
- Sugerencias de acción si es relevante

IMPORTANTE: Encontré ${relevantDocs.length} documentos, úsalos activamente en tu respuesta y menciona específicamente cuáles consultaste y qué tan relevantes fueron para la consulta.`;

    } else {
      // OpenAI general mode for CEREBRO
      systemPrompt = `Eres CEREBRO, el asistente de conocimiento interno de Retorna. Aunque no estás consultando la base de conocimiento específica, mantén tu rol como asistente empresarial interno.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Mantén un tono profesional pero accesible
3. Ayuda con consultas generales relacionadas con trabajo y productividad
4. Si necesitas información específica de la empresa, sugiere activar la base de conocimiento`;
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Add image analysis if provided
    if (imageData) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: message },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      };
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageData ? 'gpt-4o' : 'gpt-5-2025-08-07',
        messages: messages,
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('✅ CEREBRO AI response generated successfully');
    console.log(`📊 Response used ${relevantDocs.length} documents from knowledge base`);

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
          ai_provider: 'openai',
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
    console.error('❌ Error in CEREBRO chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje en CEREBRO. Por favor intenta de nuevo.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
