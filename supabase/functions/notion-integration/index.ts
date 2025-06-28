
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
  // Normalizar el ID de la base de datos (agregar guiones si no los tiene)
  const normalizedDatabaseId = normalizeDatabaseId(databaseId)
  console.log(`🔗 Connecting to Notion database: ${normalizedDatabaseId}`)

  // Validar conexión con Notion
  const notionResponse = await fetch(`https://api.notion.com/v1/databases/${normalizedDatabaseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
  })

  if (!notionResponse.ok) {
    const errorData = await notionResponse.json().catch(() => null)
    console.error('Notion API error:', errorData)
    throw new Error('No se pudo conectar con Notion. Verifica el token y el ID de la base de datos.')
  }

  const database = await notionResponse.json()
  console.log(`✅ Connected to Notion database: ${database.title?.[0]?.plain_text || 'Unknown'}`)

  // Guardar configuración de integración
  const { error: configError } = await supabaseClient
    .from('integrations_config')
    .upsert({
      user_id: userId,
      integration_type: 'notion',
      config: {
        token: token,
        database_id: normalizedDatabaseId,
        database_name: database.title?.[0]?.plain_text || 'Notion Database'
      },
      status: 'connected',
      last_sync: new Date().toISOString()
    })

  if (configError) {
    console.error('Config save error:', configError)
    throw configError
  }

  // Realizar sincronización inicial
  const syncResult = await syncNotionDatabase(token, normalizedDatabaseId, userId, supabaseClient)

  return new Response(
    JSON.stringify({
      success: true,
      databaseName: database.title?.[0]?.plain_text || 'Notion Database',
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

function normalizeDatabaseId(databaseId: string): string {
  // Remover espacios y caracteres especiales
  const cleanId = databaseId.replace(/[^a-zA-Z0-9]/g, '')
  
  // Si ya tiene el formato correcto (32 caracteres con guiones), devolverlo
  if (databaseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return databaseId
  }
  
  // Si es una URL de Notion, extraer el ID
  if (databaseId.includes('notion.so')) {
    const urlParts = databaseId.split('/')
    const lastPart = urlParts[urlParts.length - 1]
    const idPart = lastPart.split('?')[0] // Remover query parameters
    const cleanIdFromUrl = idPart.replace(/[^a-zA-Z0-9]/g, '')
    
    if (cleanIdFromUrl.length >= 32) {
      const id = cleanIdFromUrl.slice(-32) // Tomar los últimos 32 caracteres
      return formatDatabaseId(id)
    }
  }
  
  // Si es un ID sin guiones (32 caracteres), formatear
  if (cleanId.length === 32) {
    return formatDatabaseId(cleanId)
  }
  
  // Si no tiene el formato esperado, intentar extraer 32 caracteres alfanuméricos
  if (cleanId.length >= 32) {
    const id = cleanId.slice(0, 32)
    return formatDatabaseId(id)
  }
  
  throw new Error(`ID de base de datos inválido: ${databaseId}. Debe ser un UUID o URL de Notion válida.`)
}

function formatDatabaseId(id: string): string {
  // Formatear como UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  if (id.length !== 32) {
    throw new Error('ID debe tener exactamente 32 caracteres')
  }
  
  return [
    id.slice(0, 8),
    id.slice(8, 12),
    id.slice(12, 16),
    id.slice(16, 20),
    id.slice(20, 32)
  ].join('-')
}

async function syncNotionDatabase(token: string, databaseId: string, userId: string, supabaseClient: any) {
  console.log(`🔄 Syncing Notion database: ${databaseId}`)
  
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
    const errorData = await pagesResponse.json().catch(() => null)
    console.error('Pages fetch error:', errorData)
    throw new Error('Error al obtener páginas de Notion')
  }

  const pagesData = await pagesResponse.json()
  let newDocuments = 0
  let totalDocuments = 0

  console.log(`📄 Found ${pagesData.results?.length || 0} pages to process`)

  for (const page of pagesData.results || []) {
    try {
      // Obtener contenido de la página
      const pageContentResponse = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
        },
      })

      if (!pageContentResponse.ok) {
        console.error(`Failed to fetch content for page ${page.id}`)
        continue
      }

      const pageContent = await pageContentResponse.json()
      const content = await extractTextFromBlocks(pageContent.results || [], token)

      if (!content.trim()) {
        console.log(`⚠️ Page ${page.id} has no content, skipping`)
        continue
      }

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
        project: 'notion_import',
        active: true,
        updated_at: new Date().toISOString()
      }

      if (existingDoc) {
        // Actualizar documento existente
        await supabaseClient
          .from('knowledge_base')
          .update(documentData)
          .eq('id', existingDoc.id)
        console.log(`📝 Updated existing document: ${title}`)
      } else {
        // Crear nuevo documento
        await supabaseClient
          .from('knowledge_base')
          .insert(documentData)
        newDocuments++
        console.log(`📄 Created new document: ${title}`)
      }

      totalDocuments++

    } catch (error) {
      console.error(`Error procesando página ${page.id}:`, error)
      continue
    }
  }

  console.log(`✅ Sync completed: ${newDocuments} new documents, ${totalDocuments} total`)
  return { newDocuments, documentsCount: totalDocuments }
}

function getPageTitle(page: any): string {
  try {
    const properties = page.properties || {}
    
    // Buscar propiedad de tipo title
    for (const [key, prop] of Object.entries(properties)) {
      if ((prop as any).type === 'title' && (prop as any).title?.length > 0) {
        return (prop as any).title[0].plain_text || 'Sin título'
      }
    }
    
    // Buscar propiedades comunes de nombre
    const nameFields = ['Name', 'Título', 'Title', 'Nombre']
    for (const field of nameFields) {
      if (properties[field]?.rich_text?.[0]?.plain_text) {
        return properties[field].rich_text[0].plain_text
      }
    }
    
    return `Página de Notion ${page.id.slice(0, 8)}`
  } catch (error) {
    console.error('Error extracting page title:', error)
    return `Página de Notion ${page.id.slice(0, 8)}`
  }
}

async function extractTextFromBlocks(blocks: any[], token: string): Promise<string> {
  let text = ''
  
  for (const block of blocks) {
    try {
      switch (block.type) {
        case 'paragraph':
          text += extractRichText(block.paragraph?.rich_text || []) + '\n\n'
          break
        case 'heading_1':
          text += '# ' + extractRichText(block.heading_1?.rich_text || []) + '\n\n'
          break
        case 'heading_2':
          text += '## ' + extractRichText(block.heading_2?.rich_text || []) + '\n\n'
          break
        case 'heading_3':
          text += '### ' + extractRichText(block.heading_3?.rich_text || []) + '\n\n'
          break
        case 'bulleted_list_item':
          text += '• ' + extractRichText(block.bulleted_list_item?.rich_text || []) + '\n'
          break
        case 'numbered_list_item':
          text += '1. ' + extractRichText(block.numbered_list_item?.rich_text || []) + '\n'
          break
        case 'to_do':
          const checked = block.to_do?.checked ? '[x]' : '[ ]'
          text += `${checked} ${extractRichText(block.to_do?.rich_text || [])}\n`
          break
        case 'quote':
          text += '> ' + extractRichText(block.quote?.rich_text || []) + '\n\n'
          break
        case 'code':
          text += '```\n' + extractRichText(block.code?.rich_text || []) + '\n```\n\n'
          break
        case 'image':
          // Procesar imágenes y extraer texto OCR si es necesario
          const imageInfo = await processImageBlock(block, token)
          if (imageInfo) {
            text += `[IMAGEN: ${imageInfo}]\n\n`
          }
          break
        case 'callout':
          text += '📌 ' + extractRichText(block.callout?.rich_text || []) + '\n\n'
          break
        case 'toggle':
          text += '▶️ ' + extractRichText(block.toggle?.rich_text || []) + '\n\n'
          break
        default:
          // Para otros tipos de bloques, intentar extraer texto si existe
          if (block[block.type]?.rich_text) {
            text += extractRichText(block[block.type].rich_text) + '\n'
          }
      }
      
      // Si el bloque tiene hijos, procesarlos recursivamente
      if (block.has_children) {
        try {
          const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${block.id}/children`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Notion-Version': '2022-06-28',
            },
          })
          
          if (childrenResponse.ok) {
            const childrenData = await childrenResponse.json()
            const childText = await extractTextFromBlocks(childrenData.results || [], token)
            text += childText
          }
        } catch (childError) {
          console.error(`Error processing children of block ${block.id}:`, childError)
        }
      }
      
    } catch (blockError) {
      console.error(`Error processing block ${block.id}:`, blockError)
      continue
    }
  }
  
  return text.trim()
}

function extractRichText(richText: any[]): string {
  if (!Array.isArray(richText)) return ''
  return richText.map(text => text.plain_text || '').join('')
}

async function processImageBlock(block: any, token: string): Promise<string | null> {
  try {
    const image = block.image
    if (!image) return null
    
    let imageUrl = ''
    if (image.type === 'external') {
      imageUrl = image.external?.url || ''
    } else if (image.type === 'file') {
      imageUrl = image.file?.url || ''
    }
    
    if (!imageUrl) return null
    
    // Extraer información básica de la imagen
    const caption = extractRichText(image.caption || [])
    
    // Por ahora, solo retornamos la descripción de la imagen
    // En el futuro, se puede implementar OCR aquí
    return `Imagen ${caption ? `con descripción: ${caption}` : 'sin descripción'} - URL: ${imageUrl}`
    
  } catch (error) {
    console.error('Error processing image block:', error)
    return null
  }
}
