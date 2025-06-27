
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
    const { message, userId, mode = 'retorna' } = await req.json();
    
    console.log(`🤖 Processing ${mode} chat message:`, message);
    
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
    
    // Different prompts based on mode and app context
    if (mode === 'retorna') {
      // Search knowledge base for relevant content
      try {
        console.log('🔍 Searching knowledge base...');
        const { data: kbResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project')
          .eq('active', true)
          .or(`title.ilike.%${message}%,content.ilike.%${message}%`)
          .limit(3);
        
        relevantDocs = kbResults || [];
        console.log(`📚 Found ${relevantDocs.length} relevant documents`);
      } catch (error) {
        console.error('Knowledge base search error:', error);
      }

      // Build context from relevant documents
      let context = '';
      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => 
          `**${doc.title}** (${doc.project || 'General'}):\n${doc.content.substring(0, 1500)}...`
        ).join('\n\n---\n\n');
        sources = relevantDocs.map(doc => doc.title);
      }

      // Enhanced system prompt for knowledge-based chat
      systemPrompt = `Eres un asistente inteligente especializado en el conocimiento interno de la organización.

CONTEXTO DE DOCUMENTOS DISPONIBLES:
${context || 'No se encontraron documentos específicamente relevantes en la base de conocimiento para esta consulta.'}

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Sé conciso pero completo
3. Mantén un tono profesional pero accesible
4. Si tienes información específica de documentos, úsala y cítala
5. Si no tienes información suficiente en los documentos, indícalo claramente
6. SIEMPRE menciona las fuentes cuando uses información específica

FORMATO DE RESPUESTA:
- Respuesta directa y útil
- Cita fuentes cuando aplique
- Sugiere próximos pasos si es relevante`;

    } else {
      // OpenAI general mode
      systemPrompt = `Eres un asistente útil e inteligente. Responde de manera clara y útil en español.

INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Sé útil y preciso
3. Mantén un tono profesional pero amigable
4. Proporciona información completa cuando sea necesario`;
    }

    // Call OpenAI API
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

    console.log('✅ AI response generated successfully');

    // Log analytics
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: userId,
          query: message,
          sources_used: relevantDocs.length > 0 ? relevantDocs.map(doc => ({ 
            title: doc.title, 
            project: doc.project || 'General'
          })) : null,
          ai_provider: 'openai',
          response_time: 2000
        });
    } catch (analyticsError) {
      console.error('Analytics logging failed:', analyticsError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      sources: sources.length > 0 ? sources : undefined,
      foundRelevantContent: relevantDocs.length > 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
