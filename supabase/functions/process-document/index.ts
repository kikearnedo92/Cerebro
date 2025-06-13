
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to chunk text into smaller pieces
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length) break;
  }
  
  return chunks;
}

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
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Function to extract text from different file types using OpenAI
async function extractTextWithOpenAI(fileContent: Uint8Array, fileName: string): Promise<string> {
  try {
    // Convert file to base64
    const base64Content = btoa(String.fromCharCode(...fileContent));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en extracción de texto. Extrae TODO el texto legible del documento proporcionado. Devuelve solo el texto extraído, sin comentarios adicionales. Si el documento contiene tablas, convierte los datos tabulares a texto estructurado. Mantén la estructura y formato original tanto como sea posible.'
          },
          {
            role: 'user',
            content: `Extrae todo el texto del siguiente archivo: ${fileName}\n\nContenido del archivo (base64): ${base64Content.substring(0, 100000)}` // Limit to ~100KB for safety
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI text extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI extraction failed:', error);
    throw error;
  }
}

// Simple text extraction for supported formats
async function extractTextSimple(fileContent: Uint8Array, fileName: string): Promise<string> {
  const text = new TextDecoder().decode(fileContent);
  
  if (fileName.toLowerCase().endsWith('.txt')) {
    return text;
  } else if (fileName.toLowerCase().endsWith('.csv')) {
    return `Datos CSV:\n${text}`;
  } else if (fileName.toLowerCase().endsWith('.json')) {
    try {
      const jsonData = JSON.parse(text);
      return `Datos JSON:\n${JSON.stringify(jsonData, null, 2)}`;
    } catch {
      return `Datos JSON (raw):\n${text}`;
    }
  }
  
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, title, project, tags, userId } = await req.json();
    
    console.log('📄 Processing document:', fileName);
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('retorna-files')
      .download(fileUrl);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file data to Uint8Array
    const arrayBuffer = await fileData.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);

    // Extract text based on file type
    let extractedText = '';
    
    try {
      if (fileName.toLowerCase().endsWith('.txt') || 
          fileName.toLowerCase().endsWith('.csv') || 
          fileName.toLowerCase().endsWith('.json')) {
        // Simple text extraction for basic formats
        extractedText = await extractTextSimple(fileContent, fileName);
      } else if (fileName.toLowerCase().endsWith('.pdf') || 
                 fileName.toLowerCase().endsWith('.docx') || 
                 fileName.toLowerCase().endsWith('.doc')) {
        // Use OpenAI for complex document parsing
        console.log('🤖 Using OpenAI for text extraction...');
        extractedText = await extractTextWithOpenAI(fileContent, fileName);
      } else {
        // Fallback for unknown formats
        extractedText = `Documento: ${fileName}\nTítulo: ${title}\nProyecto: ${project}\n\n[Formato no soportado directamente - contenido disponible como archivo adjunto]`;
      }
    } catch (extractionError) {
      console.error('Text extraction failed, using fallback:', extractionError);
      extractedText = `Documento: ${fileName}\nTítulo: ${title}\nProyecto: ${project}\n\n[Error en extracción automática - contenido requerirá procesamiento manual]`;
    }

    console.log('✅ Text extracted, length:', extractedText.length);

    // Save main document to knowledge base
    const { data: newItem, error: insertError } = await supabase
      .from('knowledge_base')
      .insert({
        title: title,
        content: extractedText,
        project: project,
        tags: tags,
        file_url: fileUrl,
        created_by: userId,
        active: true
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save to knowledge base: ${insertError.message}`);
    }

    // Create chunks and embeddings for vector search
    if (extractedText.length > 100) { // Only create embeddings for substantial content
      console.log('🔄 Creating chunks and embeddings...');
      
      const chunks = chunkText(extractedText, 800, 100);
      const chunkPromises = chunks.map(async (chunk, index) => {
        try {
          const embedding = await createEmbedding(chunk);
          
          return supabase
            .from('document_chunks')
            .insert({
              document_id: newItem.id,
              chunk_text: chunk,
              chunk_index: index,
              embedding: `[${embedding.join(',')}]`, // Convert array to PostgreSQL vector format
              metadata: {
                source: fileName,
                project: project,
                chunk_length: chunk.length
              }
            });
        } catch (error) {
          console.error(`Failed to create embedding for chunk ${index}:`, error);
          return null;
        }
      });

      // Execute all chunk insertions
      const chunkResults = await Promise.allSettled(chunkPromises);
      const successfulChunks = chunkResults.filter(result => 
        result.status === 'fulfilled' && result.value !== null
      ).length;
      
      console.log(`✅ Created ${successfulChunks}/${chunks.length} chunks with embeddings`);
    }

    console.log('✅ Document processed and saved to knowledge base');

    return new Response(JSON.stringify({ 
      success: true,
      item: newItem,
      extractedLength: extractedText.length,
      hasEmbeddings: extractedText.length > 100
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
