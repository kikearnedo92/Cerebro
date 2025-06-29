
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { action, notion_token, database_id } = await req.json();
    
    console.log(`🔄 Notion sync action: ${action}`);
    
    if (!notion_token || !database_id) {
      throw new Error('Notion token and database ID are required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'test') {
      console.log('🧪 Testing Notion connection...');
      
      // Extract actual database ID from URL if needed
      let cleanDatabaseId = database_id;
      if (database_id.includes('notion.so')) {
        // Extract ID from URL: https://www.notion.so/myworkspace/database-name-32digithexstring
        const urlParts = database_id.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        
        // Handle both formats: with and without hyphens
        if (lastPart.includes('-')) {
          // Format: database-name-32digithex
          const parts = lastPart.split('-');
          cleanDatabaseId = parts[parts.length - 1];
        } else {
          // Direct 32-digit hex
          cleanDatabaseId = lastPart;
        }
        
        // Add hyphens to make it UUID format if it's 32 hex digits
        if (cleanDatabaseId.length === 32 && /^[0-9a-f]+$/i.test(cleanDatabaseId)) {
          cleanDatabaseId = [
            cleanDatabaseId.slice(0, 8),
            cleanDatabaseId.slice(8, 12),
            cleanDatabaseId.slice(12, 16),
            cleanDatabaseId.slice(16, 20),
            cleanDatabaseId.slice(20, 32)
          ].join('-');
        }
      }
      
      console.log(`🔍 Clean database ID: ${cleanDatabaseId}`);
      
      // Test Notion API connection
      const testResponse = await fetch(`https://api.notion.com/v1/databases/${cleanDatabaseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${notion_token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => null);
        console.error('Notion API test failed:', errorData);
        throw new Error(`Notion API error: ${testResponse.status} - ${errorData?.message || testResponse.statusText}`);
      }

      const databaseInfo = await testResponse.json();
      console.log('✅ Notion connection successful:', databaseInfo.title?.[0]?.plain_text || 'Database');
      
      return new Response(JSON.stringify({ 
        success: true, 
        database_title: databaseInfo.title?.[0]?.plain_text || 'Database',
        clean_database_id: cleanDatabaseId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync') {
      console.log('📥 Starting Notion sync...');
      
      // Extract and clean database ID
      let cleanDatabaseId = database_id;
      if (database_id.includes('notion.so')) {
        const urlParts = database_id.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        
        if (lastPart.includes('-')) {
          const parts = lastPart.split('-');
          cleanDatabaseId = parts[parts.length - 1];
        } else {
          cleanDatabaseId = lastPart;
        }
        
        if (cleanDatabaseId.length === 32 && /^[0-9a-f]+$/i.test(cleanDatabaseId)) {
          cleanDatabaseId = [
            cleanDatabaseId.slice(0, 8),
            cleanDatabaseId.slice(8, 12),
            cleanDatabaseId.slice(12, 16),
            cleanDatabaseId.slice(16, 20),
            cleanDatabaseId.slice(20, 32)
          ].join('-');
        }
      }
      
      // Fetch pages from database
      const pagesResponse = await fetch(`https://api.notion.com/v1/databases/${cleanDatabaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notion_token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page_size: 50
        })
      });

      if (!pagesResponse.ok) {
        const errorData = await pagesResponse.json().catch(() => null);
        throw new Error(`Failed to fetch pages: ${errorData?.message || pagesResponse.statusText}`);
      }

      const pagesData = await pagesResponse.json();
      console.log(`📄 Found ${pagesData.results?.length || 0} pages in database`);
      
      let processedCount = 0;
      
      for (const page of pagesData.results || []) {
        try {
          console.log(`🔄 Processing page: ${page.id}`);
          
          // Get page content
          const pageContent = await fetchNotionPageContent(notion_token, page.id);
          
          if (pageContent.content.trim()) {
            // Store in knowledge base
            const { error: insertError } = await supabase
              .from('knowledge_base')
              .upsert({
                external_id: page.id,
                title: pageContent.title,
                content: pageContent.content,
                source: 'notion',
                file_type: 'notion_page',
                project: 'notion',
                created_by: (await supabase.auth.getUser()).data.user?.id,
                active: true
              }, {
                onConflict: 'external_id'
              });

            if (insertError) {
              console.error('Error storing page:', insertError);
            } else {
              processedCount++;
              console.log(`✅ Stored page: ${pageContent.title}`);
            }
          }
        } catch (pageError) {
          console.error(`Error processing page ${page.id}:`, pageError);
        }
      }
      
      console.log(`🎉 Sync completed! Processed ${processedCount} pages`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        documents_processed: processedCount,
        message: `Successfully synced ${processedCount} documents from Notion`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('❌ Notion sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Notion sync failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchNotionPageContent(token: string, pageId: string) {
  console.log(`📖 Fetching content for page: ${pageId}`);
  
  // Get page properties first
  const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28'
    }
  });
  
  const pageData = await pageResponse.json();
  
  // Extract title from properties
  let title = 'Untitled';
  if (pageData.properties) {
    for (const [key, prop] of Object.entries(pageData.properties)) {
      if (prop.type === 'title' && prop.title?.[0]?.plain_text) {
        title = prop.title[0].plain_text;
        break;
      }
    }
  }
  
  // Get page blocks (content)
  const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28'
    }
  });
  
  const blocksData = await blocksResponse.json();
  
  let content = '';
  
  for (const block of blocksData.results || []) {
    const blockText = await extractTextFromBlock(block, token);
    if (blockText) {
      content += blockText + '\n\n';
    }
  }
  
  return {
    title,
    content: content.trim()
  };
}

async function extractTextFromBlock(block: any, token: string): Promise<string> {
  let text = '';
  
  try {
    switch (block.type) {
      case 'paragraph':
        text = extractRichText(block.paragraph?.rich_text || []);
        break;
      case 'heading_1':
        text = '# ' + extractRichText(block.heading_1?.rich_text || []);
        break;
      case 'heading_2':
        text = '## ' + extractRichText(block.heading_2?.rich_text || []);
        break;
      case 'heading_3':
        text = '### ' + extractRichText(block.heading_3?.rich_text || []);
        break;
      case 'bulleted_list_item':
        text = '• ' + extractRichText(block.bulleted_list_item?.rich_text || []);
        break;
      case 'numbered_list_item':
        text = '1. ' + extractRichText(block.numbered_list_item?.rich_text || []);
        break;
      case 'to_do':
        const checked = block.to_do?.checked ? '[x]' : '[ ]';
        text = `${checked} ${extractRichText(block.to_do?.rich_text || [])}`;
        break;
      case 'quote':
        text = '> ' + extractRichText(block.quote?.rich_text || []);
        break;
      case 'code':
        text = '```\n' + extractRichText(block.code?.rich_text || []) + '\n```';
        break;
      case 'image':
        if (block.image?.file?.url) {
          // For images, we add a description
          text = `[IMAGEN: ${block.image?.caption?.[0]?.plain_text || 'Imagen de Notion'}]`;
          
          // Try to get image description if there's a caption
          if (block.image.caption && block.image.caption.length > 0) {
            text += `\nDescripción de imagen: ${extractRichText(block.image.caption)}`;
          }
        }
        break;
      case 'divider':
        text = '---';
        break;
      case 'table':
        text = '[TABLA - contenido estructurado]';
        break;
      default:
        // For other block types, try to extract any rich_text
        if (block[block.type]?.rich_text) {
          text = extractRichText(block[block.type].rich_text);
        }
    }
    
    // Handle child blocks recursively
    if (block.has_children) {
      try {
        const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28'
          }
        });
        
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          for (const child of childrenData.results || []) {
            const childText = await extractTextFromBlock(child, token);
            if (childText) {
              text += '\n  ' + childText; // Indent child content
            }
          }
        }
      } catch (childError) {
        console.error('Error fetching child blocks:', childError);
      }
    }
    
  } catch (error) {
    console.error('Error extracting text from block:', error);
  }
  
  return text;
}

function extractRichText(richText: any[]): string {
  return richText
    .map(text => text.plain_text || '')
    .join('')
    .trim();
}
