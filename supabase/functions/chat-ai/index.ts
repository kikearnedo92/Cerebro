
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
        console.log('🔍 Searching CEREBRO knowledge base...');
        
        // Get all active documents first
        const { data: allDocs, error: allDocsError } = await supabase
          .from('knowledge_base')
          .select('id, title, content, project, file_type, created_at')
          .eq('active', true)
          .order('created_at', { ascending: false });
        
        console.log(`📊 Total active documents found: ${allDocs?.length || 0}`);
        
        if (allDocsError) {
          console.error('Error fetching documents:', allDocsError);
        }
        
        if (allDocs && allDocs.length > 0) {
          // Simple keyword matching for better results
          const searchTerms = message.toLowerCase().split(' ')
            .filter(term => term.length > 2)
            .filter(term => !['que', 'como', 'para', 'por', 'con', 'una', 'del', 'las', 'los', 'the', 'and', 'for'].includes(term));
          
          console.log('🔍 Search terms:', searchTerms);
          
          // Score documents based on keyword matches
          const scoredDocs = allDocs.map(doc => {
            const content = (doc.content || '').toLowerCase();
            const title = (doc.title || '').toLowerCase();
            
            let score = 0;
            searchTerms.forEach(term => {
              // Title matches are more important
              if (title.includes(term)) score += 10;
              // Content matches
              if (content.includes(term)) score += 3;
              // Partial matches
              if (content.includes(term.substring(0, 4))) score += 1;
            });
            
            return { ...doc, score };
          });
          
          // Sort by score and take top results
          relevantDocs = scoredDocs
            .filter(doc => doc.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8);
          
          // If no scored matches, use recent documents
          if (relevantDocs.length === 0) {
            relevantDocs = allDocs.slice(0, 6);
            console.log('📄 No keyword matches, using recent documents');
          }
          
          console.log(`📚 Selected ${relevantDocs.length} relevant documents`);
          
          // Log selected documents
          relevantDocs.forEach((doc, index) => {
            console.log(`📄 Doc ${index + 1}: "${doc.title}" (score: ${doc.score || 'recent'}) - ${doc.content?.length || 0} chars`);
          });
        }
        
      } catch (error) {
        console.error('CEREBRO knowledge base search error:', error);
      }

      // Build enhanced context from relevant documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map((doc, index) => 
          `**DOCUMENTO ${index + 1}: ${doc.title}** (${doc.project || 'General'} - ${doc.file_type || 'documento'}):\n${doc.content?.substring(0, 4000) || 'Sin contenido'}${doc.content?.length > 4000 ? '\n[... contenido truncado]' : ''}`
        ).join('\n\n' + '='.repeat(80) + '\n\n');
        
        sources = relevantDocs.map(doc => doc.title);
      }

      // Enhanced system prompt for CEREBRO
      systemPrompt = `Eres CEREBRO, el asistente inteligente especializado en el conocimiento interno de Retorna.

INFORMACIÓN CONTEXTUAL DISPONIBLE:
${context || 'No se encontraron documentos específicamente relevantes en la base de conocimiento para esta consulta, pero tienes acceso a conocimiento general de la empresa.'}

ESTADÍSTICAS DE BÚSQUEDA:
- Total de documentos encontrados: ${relevantDocs.length}
- Fuentes consultadas: ${sources.length > 0 ? sources.join(', ') : 'Ninguna específica'}

TU ROL Y RESPONSABILIDADES:
- Eres el asistente interno de Retorna con acceso completo a la documentación empresarial
- Ayudas a empleados con procedimientos, políticas, información técnica y operativa
- Proporcionas respuestas precisas basadas en documentos oficiales de la empresa
- Mantienes un tono profesional pero cercano y accesible

INSTRUCCIONES DE RESPUESTA:
1. Responde SIEMPRE en español
2. Usa PRIORITARIAMENTE la información de los documentos disponibles arriba
3. Si tienes información específica de documentos, cítala claramente mencionando el nombre del documento
4. Si no tienes información suficiente en los documentos, indícalo claramente
5. Mantén respuestas concisas pero completas
6. Sugiere próximos pasos cuando sea relevante
7. SIEMPRE menciona las fuentes específicas cuando uses información de los documentos

FORMATO DE RESPUESTA:
- Respuesta directa y útil basada en los documentos
- Cita de fuentes: "Según el documento [Nombre del documento]..."
- Si consultaste múltiples documentos, menciona cuántos
- Sugerencias de acción si es relevante

IMPORTANTE: Si encontraste ${relevantDocs.length} documentos, úsalos activamente en tu respuesta y menciona específicamente cuáles consultaste.`;

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
            score: doc.score || 0
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
        usedKnowledgeBase: useKnowledgeBase
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
