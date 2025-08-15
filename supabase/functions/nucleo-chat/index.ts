
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
    const { message, useKnowledgeBase, conversationId, imageData } = await req.json();
    
    console.log(`🚀 NÚCLEO Chat - Processing message:`, message);
    
    if (!message?.trim()) {
      throw new Error('Message is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let relevantDocs: any[] = [];
    let systemPrompt = '';
    
    if (useKnowledgeBase) {
      // Search NÚCLEO-specific knowledge base
      try {
        console.log('🔍 Searching NÚCLEO knowledge base...');
        const { data: kbResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project')
          .eq('active', true)
          .eq('project', 'nucleo') // NÚCLEO-specific KB
          .or(`title.ilike.%${message}%,content.ilike.%${message}%`)
          .limit(3);
        
        relevantDocs = kbResults || [];
        console.log(`📚 Found ${relevantDocs.length} relevant NÚCLEO documents`);
      } catch (error) {
        console.error('NÚCLEO knowledge base search error:', error);
      }

      // Build context from relevant documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => 
          `**${doc.title}**:\n${doc.content.substring(0, 1500)}...`
        ).join('\n\n---\n\n');
      }

      // NÚCLEO-specific system prompt
      systemPrompt = `Eres el asistente AI de NÚCLEO, la plataforma comercial de AI para negocios.

NÚCLEO es una herramienta para founders y equipos que necesitan:
- Launch: Estrategia de lanzamiento desde voice input hasta campañas automatizadas
- AutoDev: Generación de código y desarrollo automático con Claude + Lovable
- Automation: Workflows con n8n para automatizar operaciones
- Insights: Analytics predictivo para detectar fricción y churn
- Memory: Base de conocimiento empresarial para respuestas rápidas

CONTEXTO DE NÚCLEO:
${context || 'No se encontraron documentos específicos en la base de conocimiento de NÚCLEO para esta consulta.'}

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Sé práctico y orientado a resultados de negocio
3. Enfócate en soluciones que generen ROI
4. Ayuda con estrategias comerciales, no solo técnicas
5. Si no tienes información específica, sugiere cómo obtenerla
6. Mantén un tono profesional pero accesible para founders

ÁREAS DE EXPERTISE:
- Growth marketing y GTM strategy
- Product development y user experience
- Business intelligence y analytics
- Automation y workflow optimization
- AI implementation para negocios`;

    } else {
      // OpenAI general mode for NÚCLEO
      systemPrompt = `Eres el asistente AI de NÚCLEO, especializado en ayudar a founders y equipos comerciales.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Enfócate en estrategias comerciales y de negocio
3. Proporciona insights prácticos para founders
4. Mantén un tono profesional pero accesible`;
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
        max_completion_tokens: 2000,
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

    console.log('✅ NÚCLEO AI response generated successfully');

    // Log analytics for NÚCLEO
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          query: message,
          sources_used: relevantDocs.length > 0 ? relevantDocs.map(doc => ({ 
            title: doc.title, 
            project: 'nucleo'
          })) : null,
          ai_provider: 'openai',
          response_time: 2000
        });
    } catch (analyticsError) {
      console.error('NÚCLEO Analytics logging failed:', analyticsError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      documentsUsed: relevantDocs.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in nucleo-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje en NÚCLEO. Por favor intenta de nuevo.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
