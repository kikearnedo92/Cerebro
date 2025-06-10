
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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

    // Extract text based on file type
    let extractedText = '';
    
    if (fileName.toLowerCase().endsWith('.txt')) {
      extractedText = await fileData.text();
    } else if (fileName.toLowerCase().endsWith('.csv')) {
      const csvText = await fileData.text();
      extractedText = `Datos CSV:\n${csvText}`;
    } else if (fileName.toLowerCase().endsWith('.json')) {
      const jsonText = await fileData.text();
      extractedText = `Datos JSON:\n${jsonText}`;
    } else if (fileName.toLowerCase().endsWith('.pdf')) {
      // For PDFs, we'll store metadata for now - in production you'd use a PDF parser
      extractedText = `Documento PDF: ${fileName}\nTítulo: ${title}\nProyecto: ${project}\n\n[Este documento PDF requiere procesamiento manual por el administrador. El contenido se agregará pronto.]`;
    } else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      // For Word docs, we'll store metadata for now - in production you'd use a Word parser
      extractedText = `Documento Word: ${fileName}\nTítulo: ${title}\nProyecto: ${project}\n\n[Este documento Word requiere procesamiento manual por el administrador. El contenido se agregará pronto.]`;
    } else {
      extractedText = `Documento: ${fileName}\nTipo: Archivo adjunto\nTítulo: ${title}\nProyecto: ${project}\n\nEste archivo fue subido exitosamente y está disponible para el equipo.`;
    }

    console.log('✅ Text extracted, length:', extractedText.length);

    // Save to knowledge base
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

    console.log('✅ Document processed and saved to knowledge base');

    return new Response(JSON.stringify({ 
      success: true,
      item: newItem,
      extractedLength: extractedText.length
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
