
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotionPage {
  id: string;
  properties: any;
  parent: any;
  children?: NotionBlock[];
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, notion_token, database_id } = await req.json();
    
    console.log(`🔗 Notion action: ${action}`);
    
    if (!notion_token) {
      throw new Error('Notion token is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'test') {
      console.log('🧪 Testing Notion connection...');
      
      // Test connection with database or page
      let notionUrl = '';
      let isDatabase = false;
      
      // Handle different URL formats - extract ID from URL or use direct ID
      let pageId = database_id;
      if (database_id.includes('notion.so')) {
        // Extract ID from URL - handle both formats with and without hyphens
        const urlMatch = database_id.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
        if (urlMatch) {
          pageId = urlMatch[1].replace(/-/g, ''); // Remove hyphens for API calls
        }
      }
      
      console.log(`🔍 Testing with page ID: ${pageId}`);
      
      // Try as database first
      try {
        notionUrl = `https://api.notion.com/v1/databases/${pageId}`;
        const response = await fetch(notionUrl, {
          headers: {
            'Authorization': `Bearer ${notion_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          isDatabase = true;
          console.log('✅ Connected as database');
        } else {
          throw new Error('Not a database');
        }
      } catch (dbError) {
        // Try as page
        console.log('🔄 Trying as page...');
        notionUrl = `https://api.notion.com/v1/pages/${pageId}`;
        const response = await fetch(notionUrl, {
          headers: {
            'Authorization': `Bearer ${notion_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Notion API error: ${response.status} - ${errorData.message || 'Invalid page or database ID'}`);
        }
        
        console.log('✅ Connected as page');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        type: isDatabase ? 'database' : 'page',
        pageId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'sync') {
      console.log('🔄 Starting Notion sync...');
      
      // Extract page ID from URL or use direct ID
      let pageId = database_id;
      if (database_id.includes('notion.so')) {
        const urlMatch = database_id.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
        if (urlMatch) {
          pageId = urlMatch[1].replace(/-/g, '');
        }
      }
      
      console.log(`📄 Syncing page ID: ${pageId}`);
      
      let documents = [];
      
      // Try to sync as database first
      try {
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${pageId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notion_token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          console.log(`📊 Found ${dbData.results?.length || 0} pages in database`);
          
          for (const page of dbData.results || []) {
            const pageContent = await extractPageContent(page.id, notion_token);
            if (pageContent.title && pageContent.content) {
              documents.push({
                title: pageContent.title,
                content: pageContent.content,
                project: 'Notion Database',
                file_type: 'notion_page',
                source_url: `https://notion.so/${page.id}`,
                notion_page_id: page.id
              });
            }
          }
        } else {
          throw new Error('Not a database, trying as page...');
        }
      } catch (dbError) {
        console.log('🔄 Not a database, processing as single page...');
        
        // Process as single page
        const pageContent = await extractPageContent(pageId, notion_token);
        if (pageContent.title && pageContent.content) {
          documents.push({
            title: pageContent.title,
            content: pageContent.content,
            project: 'Notion Page',
            file_type: 'notion_page',
            source_url: database_id,
            notion_page_id: pageId
          });
        }
      }
      
      console.log(`📝 Extracted ${documents.length} documents`);
      
      // Save documents to knowledge base
      let documentsProcessed = 0;
      
      for (const doc of documents) {
        try {
          // Check if document already exists
          const { data: existing } = await supabase
            .from('knowledge_base')
            .select('id')
            .eq('notion_page_id', doc.notion_page_id)
            .single();
          
          if (existing) {
            // Update existing document
            const { error: updateError } = await supabase
              .from('knowledge_base')
              .update({
                title: doc.title,
                content: doc.content,
                project: doc.project,
                file_type: doc.file_type,
                source_url: doc.source_url,
                updated_at: new Date().toISOString(),
                active: true
              })
              .eq('id', existing.id);
              
            if (updateError) {
              console.error('Update error:', updateError);
            } else {
              documentsProcessed++;
              console.log(`📝 Updated: ${doc.title}`);
            }
          } else {
            // Insert new document
            const { error: insertError } = await supabase
              .from('knowledge_base')
              .insert({
                title: doc.title,
                content: doc.content,
                project: doc.project,
                file_type: doc.file_type,
                source_url: doc.source_url,
                notion_page_id: doc.notion_page_id,
                active: true
              });
              
            if (insertError) {
              console.error('Insert error:', insertError);
            } else {
              documentsProcessed++;
              console.log(`📝 Inserted: ${doc.title}`);
            }
          }
        } catch (docError) {
          console.error(`Error processing document ${doc.title}:`, docError);
        }
      }
      
      console.log(`✅ Processed ${documentsProcessed} documents successfully`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        documents_processed: documentsProcessed,
        total_found: documents.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('❌ Notion sync error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Sync failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function extractPageContent(pageId: string, notionToken: string): Promise<{ title: string; content: string }> {
  try {
    // Get page details
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status}`);
    }
    
    const pageData = await pageResponse.json();
    
    // Extract title from properties
    let title = 'Untitled';
    if (pageData.properties) {
      for (const [key, value] of Object.entries(pageData.properties)) {
        if (value.type === 'title' && value.title?.length > 0) {
          title = value.title.map(t => t.plain_text).join('');
          break;
        }
      }
    }
    
    // Get page blocks (content)
    const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (!blocksResponse.ok) {
      console.warn(`Failed to fetch blocks for page ${pageId}: ${blocksResponse.status}`);
      return { title, content: '' };
    }
    
    const blocksData = await blocksResponse.json();
    
    // Extract text content from blocks
    let content = '';
    
    for (const block of blocksData.results || []) {
      const blockText = await extractBlockText(block, notionToken);
      if (blockText) {
        content += blockText + '\n\n';
      }
    }
    
    console.log(`📄 Extracted page: ${title} (${content.length} characters)`);
    
    return { title, content: content.trim() };
    
  } catch (error) {
    console.error(`Error extracting page content for ${pageId}:`, error);
    return { title: '', content: '' };
  }
}

async function extractBlockText(block: NotionBlock, notionToken: string): Promise<string> {
  try {
    let text = '';
    
    switch (block.type) {
      case 'paragraph':
        text = block.paragraph?.rich_text?.map(t => t.plain_text).join('') || '';
        break;
        
      case 'heading_1':
        text = `# ${block.heading_1?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'heading_2':
        text = `## ${block.heading_2?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'heading_3':
        text = `### ${block.heading_3?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'bulleted_list_item':
        text = `• ${block.bulleted_list_item?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'numbered_list_item':
        text = `1. ${block.numbered_list_item?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'to_do':
        const checked = block.to_do?.checked ? '✓' : '☐';
        text = `${checked} ${block.to_do?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'quote':
        text = `> ${block.quote?.rich_text?.map(t => t.plain_text).join('') || ''}`;
        break;
        
      case 'code':
        text = `\`\`\`${block.code?.language || ''}\n${block.code?.rich_text?.map(t => t.plain_text).join('') || ''}\n\`\`\``;
        break;
        
      case 'image':
        const imageUrl = block.image?.file?.url || block.image?.external?.url;
        if (imageUrl) {
          // Try to extract text from image using OpenAI vision if available
          text = `[IMAGEN: ${imageUrl}]`;
          // TODO: Implement image analysis using OpenAI Vision API
        }
        break;
        
      case 'divider':
        text = '---';
        break;
        
      default:
        // Handle other block types
        if (block[block.type]?.rich_text) {
          text = block[block.type].rich_text.map(t => t.plain_text).join('');
        }
        break;
    }
    
    // Handle nested blocks
    if (block.has_children) {
      const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children`, {
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Notion-Version': '2022-06-28'
        }
      });
      
      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        for (const child of childrenData.results || []) {
          const childText = await extractBlockText(child, notionToken);
          if (childText) {
            text += '\n  ' + childText;
          }
        }
      }
    }
    
    return text;
    
  } catch (error) {
    console.error('Error extracting block text:', error);
    return '';
  }
}
