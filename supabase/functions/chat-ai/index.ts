
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
      // Enhanced search strategy - multiple approaches
      try {
        console.log('🔍 Searching CEREBRO knowledge base...');
        
        // Search by content similarity (main search)
        const { data: contentResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project, file_type')
          .eq('active', true)
          .ilike('content', `%${message}%`)
          .limit(3);
        
        // Search by title similarity (secondary search)
        const { data: titleResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project, file_type')
          .eq('active', true)
          .ilike('title', `%${message}%`)
          .limit(2);
        
        // Get most recent documents if no direct matches
        const { data: recentResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project, file_type')
          .eq('active', true)
          .order('updated_at', { ascending: false })
          .limit(2);
        
        // Combine and deduplicate results
        const allResults = [
          ...(contentResults || []),
          ...(titleResults || []),
          ...(recentResults || [])
        ];
        
        // Remove duplicates by title
        const uniqueResults = allResults.filter((doc, index, self) => 
          index === self.findIndex(d => d.title === doc.title)
        );
        
        relevantDocs = uniqueResults.slice(0, 5); // Limit to top 5
        console.log(`📚 Found ${relevantDocs.length} relevant documents in CEREBRO KB`);
        
        // Log document titles for debugging
        relevantDocs.forEach(doc => {
          console.log(`📄 Document: ${doc.title} (${doc.file_type || 'unknown'})`);
        });
        
      } catch (error) {
        console.error('CEREBRO knowledge base search error:', error);
      }

      // Build context from relevant documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => 
          `**${doc.title}** (${doc.project || 'General'}):\n${doc.content.substring(0, 2000)}${doc.content.length > 2000 ? '...' : ''}`
        ).join('\n\n---\n\n');
        sources = relevantDocs.map(doc => doc.title);
      }

      // Enhanced system prompt for CEREBRO
      systemPrompt = `Eres CEREBRO, el asistente inteligente especializado en el conocimiento interno de Retorna.

INFORMACIÓN CONTEXTUAL DISPONIBLE:
${context || 'No se encontraron documentos específicamente relevantes en la base de conocimiento para esta consulta, pero tienes acceso a conocimiento general de la empresa.'}

TU ROL Y RESPONSABILIDADES:
- Eres el asistente interno de Retorna con acceso completo a la documentación empresarial
- Ayudas a empleados con procedimientos, políticas, información técnica y operativa
- Proporcionas respuestas precisas basadas en documentos oficiales de la empresa
- Mantienes un tono profesional pero cercano y accesible

INSTRUCCIONES DE RESPUESTA:
1. Responde SIEMPRE en español
2. Usa PRIORITARIAMENTE la información de los documentos disponibles
3. Si tienes información específica de documentos, cítala claramente
4. Si no tienes información suficiente en los documentos, indícalo y ofrece lo que puedas basado en conocimiento general
5. Mantén respuestas concisas pero completas
6. Sugiere próximos pasos cuando sea relevante
7. SIEMPRE menciona las fuentes cuando uses información específica

FORMATO DE RESPUESTA:
- Respuesta directa y útil
- Cita de fuentes cuando aplique: "Según el documento [Nombre del documento]..."
- Sugerencias de acción si es relevante`;

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
        model: imageData ? 'gpt-4o' : 'gpt-4o-mini',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.3,
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

    // Log analytics
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          query: message,
          sources_used: relevantDocs.length > 0 ? relevantDocs.map(doc => ({ 
            title: doc.title, 
            project: doc.project || 'General',
            file_type: doc.file_type || 'unknown'
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
      foundRelevantContent: relevantDocs.length > 0
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
