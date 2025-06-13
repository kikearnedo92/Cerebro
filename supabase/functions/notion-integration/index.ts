
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, token, databaseId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Obtener usuario actual
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('No autorizado')
    }

    switch (action) {
      case 'connect':
        return await handleConnect(token, databaseId, user.id, supabaseClient)
      case 'sync':
        return await handleSync(user.id, supabaseClient)
      case 'disconnect':
        return await handleDisconnect(user.id, supabaseClient)
      default:
        throw new Error('Acción no válida')
    }

  } catch (error) {
    console.error('Error in notion-integration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleConnect(token: string, databaseId: string, userId: string, supabaseClient: any) {
  // Validar conexión con Notion
  const notionResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  })

  if (!notionResponse.ok) {
    throw new Error('No se pudo conectar con Notion. Verifica el token y el ID de la base de datos.')
  }

  const database = await notionResponse.json()

  // Guardar configuración de integración
  const { error: configError } = await supabaseClient
    .from('integrations_config')
    .upsert({
      user_id: userId,
      integration_type: 'notion',
      config: {
        token: token, // En producción, esto debería estar encriptado
        database_id: databaseId,
        database_name: database.title[0]?.plain_text || 'Notion Database'
      },
      status: 'connected',
      last_sync: new Date().toISOString()
    })

  if (configError) {
    throw configError
  }

  // Realizar sincronización inicial
  const syncResult = await syncNotionDatabase(token, databaseId, userId, supabaseClient)

  return new Response(
    JSON.stringify({
      success: true,
      databaseName: database.title[0]?.plain_text || 'Notion Database',
      documentsCount: syncResult.documentsCount
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function handleSync(userId: string, supabaseClient: any) {
  // Obtener configuración de Notion
  const { data: config, error: configError } = await supabaseClient
    .from('integrations_config')
    .select('*')
    .eq('user_id', userId)
    .eq('integration_type', 'notion')
    .eq('status', 'connected')
    .single()

  if (configError || !config) {
    throw new Error('Integración de Notion no encontrada o no está conectada')
  }

  const { token, database_id } = config.config
  const syncResult = await syncNotionDatabase(token, database_id, userId, supabaseClient)

  // Actualizar última sincronización
  await supabaseClient
    .from('integrations_config')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', config.id)

  return new Response(
    JSON.stringify({
      success: true,
      newDocuments: syncResult.newDocuments,
      documentsCount: syncResult.documentsCount
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function handleDisconnect(userId: string, supabaseClient: any) {
  // Eliminar configuración de integración
  const { error } = await supabaseClient
    .from('integrations_config')
    .delete()
    .eq('user_id', userId)
    .eq('integration_type', 'notion')

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

async function syncNotionDatabase(token: string, databaseId: string, userId: string, supabaseClient: any) {
  // Obtener páginas de la base de datos
  const pagesResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_size: 100
    })
  })

  if (!pagesResponse.ok) {
    throw new Error('Error al obtener páginas de Notion')
  }

  const pagesData = await pagesResponse.json()
  let newDocuments = 0
  let totalDocuments = 0

  for (const page of pagesData.results) {
    try {
      // Obtener contenido de la página
      const pageContentResponse = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
        },
      })

      if (!pageContentResponse.ok) continue

      const pageContent = await pageContentResponse.json()
      const content = extractTextFromBlocks(pageContent.results)

      if (!content.trim()) continue

      // Verificar si el documento ya existe
      const { data: existingDoc } = await supabaseClient
        .from('knowledge_base')
        .select('id')
        .eq('external_id', page.id)
        .single()

      const title = getPageTitle(page)
      const documentData = {
        title: title,
        content: content,
        file_type: 'notion_page',
        external_id: page.id,
        source: 'notion',
        user_id: userId,
        updated_at: new Date().toISOString()
      }

      if (existingDoc) {
        // Actualizar documento existente
        await supabaseClient
          .from('knowledge_base')
          .update(documentData)
          .eq('id', existingDoc.id)
      } else {
        // Crear nuevo documento
        await supabaseClient
          .from('knowledge_base')
          .insert(documentData)
        newDocuments++
      }

      totalDocuments++

    } catch (error) {
      console.error(`Error procesando página ${page.id}:`, error)
      continue
    }
  }

  return { newDocuments, documentsCount: totalDocuments }
}

function getPageTitle(page: any): string {
  // Intentar extraer título de diferentes propiedades
  const properties = page.properties
  
  // Buscar propiedad de tipo title
  for (const [key, prop] of Object.entries(properties)) {
    if ((prop as any).type === 'title' && (prop as any).title?.length > 0) {
      return (prop as any).title[0].plain_text
    }
  }
  
  // Buscar propiedad llamada "Name" o "Título"
  if (properties.Name?.rich_text?.[0]?.plain_text) {
    return properties.Name.rich_text[0].plain_text
  }
  
  if (properties.Título?.rich_text?.[0]?.plain_text) {
    return properties.Título.rich_text[0].plain_text
  }
  
  return `Página de Notion ${page.id.slice(0, 8)}`
}

function extractTextFromBlocks(blocks: any[]): string {
  let text = ''
  
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        text += extractRichText(block.paragraph.rich_text) + '\n\n'
        break
      case 'heading_1':
        text += '# ' + extractRichText(block.heading_1.rich_text) + '\n\n'
        break
      case 'heading_2':
        text += '## ' + extractRichText(block.heading_2.rich_text) + '\n\n'
        break
      case 'heading_3':
        text += '### ' + extractRichText(block.heading_3.rich_text) + '\n\n'
        break
      case 'bulleted_list_item':
        text += '• ' + extractRichText(block.bulleted_list_item.rich_text) + '\n'
        break
      case 'numbered_list_item':
        text += '1. ' + extractRichText(block.numbered_list_item.rich_text) + '\n'
        break
      case 'to_do':
        const checked = block.to_do.checked ? '[x]' : '[ ]'
        text += `${checked} ${extractRichText(block.to_do.rich_text)}\n`
        break
      case 'quote':
        text += '> ' + extractRichText(block.quote.rich_text) + '\n\n'
        break
      case 'code':
        text += '```\n' + extractRichText(block.code.rich_text) + '\n```\n\n'
        break
      default:
        // Para otros tipos de bloques, intentar extraer texto si existe
        if (block[block.type]?.rich_text) {
          text += extractRichText(block[block.type].rich_text) + '\n'
        }
    }
  }
  
  return text.trim()
}

function extractRichText(richText: any[]): string {
  return richText.map(text => text.plain_text).join('')
}
