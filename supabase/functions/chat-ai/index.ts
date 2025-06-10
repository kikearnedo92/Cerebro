
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    console.log('🤖 Processing chat message:', message);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Search knowledge base for relevant documents
    const { data: knowledgeDocs, error: searchError } = await supabase
      .from('knowledge_base')
      .select('title, content, project')
      .eq('active', true)
      .or(`title.ilike.%${message}%,content.ilike.%${message}%`)
      .limit(3);

    if (searchError) {
      console.error('Knowledge search error:', searchError);
    }

    // Build context from knowledge base
    let context = '';
    let sources: string[] = [];
    
    if (knowledgeDocs && knowledgeDocs.length > 0) {
      context = knowledgeDocs.map(doc => 
        `**${doc.title}** (${doc.project}):\n${doc.content}`
      ).join('\n\n---\n\n');
      sources = knowledgeDocs.map(doc => doc.title);
      console.log('📚 Found relevant documents:', sources);
    }

    // Call OpenAI API
    const systemPrompt = `Eres CEREBRO, la plataforma de conocimiento inteligente de Retorna (fintech de remesas).

Tu función es ayudar al equipo interno con información sobre:
- Atención al cliente y resolución de casos
- Investigaciones y análisis de mercado
- Políticas específicas por país (Chile, Colombia, España, Venezuela, Brasil, Perú)
- Procedimientos operativos internos
- Scripts de respuesta para diferentes situaciones
- Normativas y compliance
- Conocimiento organizacional y mejores prácticas

IDENTIDAD - CEREBRO:
- Eres la plataforma de conocimiento definitiva de Retorna
- Tu nombre es CEREBRO, no "Retorna AI"
- Tienes acceso a toda la base de conocimiento interna
- Eres experto en todos los procesos y políticas de Retorna
- Respondes de forma inteligente, precisa y útil

CONTEXTO DE DOCUMENTOS REALES:
${context || 'No se encontraron documentos relevantes en la base de conocimiento.'}

INSTRUCCIONES:
1. Responde de forma concisa pero completa
2. Mantén un tono profesional pero accesible
3. Si no tienes información suficiente, indica qué información específica necesitas
4. Para temas de ATC, sugiere scripts de respuesta cuando sea apropiado
5. Para research, proporciona contexto y metodología cuando esté disponible
6. SIEMPRE cita las fuentes cuando uses información específica de documentos
7. Si la información viene de la base de conocimiento, mencionalo claramente`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ OpenAI response generated');

    // Log analytics
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: userId,
          query: message,
          sources_used: knowledgeDocs?.length > 0 ? knowledgeDocs.map(doc => ({ 
            title: doc.title, 
            project: doc.project 
          })) : null,
          ai_provider: 'openai',
          response_time: 1500
        });
    } catch (analyticsError) {
      console.error('Analytics logging failed:', analyticsError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      sources: sources
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
