
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

// Function to create embeddings using OpenAI
async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' ').trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    console.log('🤖 Processing chat message:', message);
    
    // Initialize Supabase client with service role for vector search
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create embedding for the user's question
    let relevantDocs: any[] = [];
    let sources: string[] = [];
    
    try {
      console.log('🔍 Creating embedding for question...');
      const questionEmbedding = await createEmbedding(message);
      
      // Search for relevant document chunks using vector similarity
      console.log('📚 Searching for relevant document chunks...');
      const { data: vectorResults, error: vectorError } = await supabase
        .rpc('search_documents', {
          query_embedding: `[${questionEmbedding.join(',')}]`,
          similarity_threshold: 0.7,
          match_count: 5
        });

      if (vectorError) {
        console.error('Vector search error:', vectorError);
        // Fallback to simple text search if vector search fails
        const { data: fallbackResults } = await supabase
          .from('knowledge_base')
          .select('title, content, project')
          .eq('active', true)
          .or(`title.ilike.%${message}%,content.ilike.%${message}%`)
          .limit(3);
        
        relevantDocs = fallbackResults || [];
      } else {
        relevantDocs = vectorResults || [];
        console.log(`✅ Found ${relevantDocs.length} relevant chunks via vector search`);
      }
    } catch (embeddingError) {
      console.error('Embedding creation failed, using fallback search:', embeddingError);
      // Fallback to simple text search
      const { data: fallbackResults } = await supabase
        .from('knowledge_base')
        .select('title, content, project')
        .eq('active', true)
        .or(`title.ilike.%${message}%,content.ilike.%${message}%`)
        .limit(3);
      
      relevantDocs = fallbackResults || [];
    }

    // Build context from relevant documents
    let context = '';
    
    if (relevantDocs.length > 0) {
      if (relevantDocs[0].chunk_text) {
        // Vector search results (with chunks)
        context = relevantDocs.map(doc => 
          `**${doc.title}**:\n${doc.chunk_text}`
        ).join('\n\n---\n\n');
        sources = [...new Set(relevantDocs.map(doc => doc.title))]; // Remove duplicates
      } else {
        // Fallback search results (full documents)
        context = relevantDocs.map(doc => 
          `**${doc.title}** (${doc.project}):\n${doc.content.substring(0, 1500)}...`
        ).join('\n\n---\n\n');
        sources = relevantDocs.map(doc => doc.title);
      }
      console.log('📖 Built context from documents:', sources);
    } else {
      console.log('❌ No relevant documents found');
    }

    // Enhanced system prompt for CEREBRO
    const systemPrompt = `Eres CEREBRO, la plataforma de conocimiento inteligente de Retorna (fintech de remesas).

IDENTIDAD - CEREBRO:
- Eres la plataforma de conocimiento definitiva de Retorna
- Tu nombre es CEREBRO, no "Retorna AI" ni "Assistant"
- Tienes acceso a toda la base de conocimiento interna
- Eres experto en todos los procesos y políticas de Retorna
- Respondes de forma inteligente, precisa y útil

ESPECIALIZACIÓN:
- Atención al cliente y resolución de casos
- Investigaciones y análisis de mercado
- Políticas específicas por país (Chile, Colombia, España, Venezuela, Brasil, Perú)
- Procedimientos operativos internos
- Scripts de respuesta para diferentes situaciones
- Normativas y compliance
- Conocimiento organizacional y mejores prácticas

CONTEXTO DE DOCUMENTOS DISPONIBLES:
${context || 'No se encontraron documentos específicamente relevantes en la base de conocimiento para esta consulta.'}

INSTRUCCIONES DE RESPUESTA:
1. Responde SIEMPRE en español
2. Sé conciso pero completo
3. Mantén un tono profesional pero accesible
4. Si tienes información específica de documentos, úsala y cítala
5. Para temas de ATC, sugiere scripts de respuesta cuando sea apropiado
6. Para research, proporciona contexto y metodología cuando esté disponible
7. Si no tienes información suficiente en los documentos, indícalo claramente
8. SIEMPRE menciona las fuentes cuando uses información específica
9. Si la pregunta está fuera del alcance de Retorna, redirige educadamente al contexto empresarial

FORMATO DE RESPUESTA:
- Respuesta directa y útil
- Cita fuentes cuando aplique
- Sugiere próximos pasos si es relevante`;

    // Call OpenAI API with enhanced context
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
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ OpenAI response generated successfully');

    // Log analytics
    try {
      await supabase
        .from('usage_analytics')
        .insert({
          user_id: userId,
          query: message,
          sources_used: relevantDocs.length > 0 ? relevantDocs.map(doc => ({ 
            title: doc.title, 
            project: doc.project || 'General',
            similarity: doc.similarity || null 
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
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo. Si el problema persiste, contacta al administrador.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
