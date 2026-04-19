// POST /api/integrations/notion/sync
// Pulls pages + databases from the user's Notion, extracts plain text + properties,
// and upserts into knowledge_base. Tombstone any previously synced row that no longer
// appears in Notion (deleted or unshared with the integration).
//
// Auth: user session (Bearer) OR internal header `x-internal-sync-token` + integrationId.
//
// Retrieval today is text-based (`search_knowledge_semantic` ILIKE+pg_trgm);
// vector embeddings are a separate upgrade path pending embedding-provider decision.
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { decryptToken } from '../_lib/crypto.js'

const NOTION_API = 'https://api.notion.com/v1'
const PER_DOC_CHAR_CAP = 30000
const PAGE_BLOCK_ITER_CAP = 20 // ~2000 blocks/page max
const SEARCH_ITER_CAP = 20 // ~1000 objects max
const DB_QUERY_ITER_CAP = 10 // ~1000 rows per database

async function notionFetch(token, path, options = {}) {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion API ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

async function getPageText(token, pageId) {
  let text = ''
  let cursor
  let iter = 0
  do {
    const data = await notionFetch(
      token,
      `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`
    )
    for (const block of data.results) {
      text += extractBlockText(block) + '\n'
      if (block.has_children) {
        try {
          text += (await getPageText(token, block.id)) + '\n'
        } catch {
          /* skip */
        }
      }
    }
    cursor = data.next_cursor
    iter++
  } while (cursor && iter < PAGE_BLOCK_ITER_CAP)
  return text.trim()
}

function extractBlockText(block) {
  const type = block.type
  const payload = block[type]
  if (!payload) return ''
  // Covers paragraph, heading_*, bulleted_list_item, numbered_list_item, to_do, toggle,
  // quote, callout, code, and similar blocks that expose rich_text.
  const rt = payload.rich_text || payload.text || []
  return rt.map((t) => t.plain_text || '').join('')
}

function titleFromRichText(richText) {
  return (richText || []).map((t) => t.plain_text || '').join('').trim()
}

function objectTitle(obj) {
  if (!obj) return 'Sin título'
  // Databases expose `title` directly; pages expose it inside properties.
  if (Array.isArray(obj.title) && obj.title.length) return titleFromRichText(obj.title) || 'Sin título'
  const props = obj.properties || {}
  for (const v of Object.values(props)) {
    if (v?.type === 'title') return titleFromRichText(v.title) || 'Sin título'
  }
  return 'Sin título'
}

// Flatten Notion property values into "Name: value" lines that the text-based
// retrieval can match on. We skip files, formulas and relations (noisy or large).
function propertiesAsText(properties) {
  if (!properties) return ''
  const out = []
  for (const [name, v] of Object.entries(properties)) {
    const value = flattenProperty(v)
    if (value) out.push(`${name}: ${value}`)
  }
  return out.join('\n')
}

function flattenProperty(v) {
  if (!v?.type) return ''
  switch (v.type) {
    case 'title':
    case 'rich_text':
      return titleFromRichText(v[v.type])
    case 'number':
      return v.number != null ? String(v.number) : ''
    case 'select':
      return v.select?.name || ''
    case 'multi_select':
      return (v.multi_select || []).map((s) => s.name).join(', ')
    case 'status':
      return v.status?.name || ''
    case 'date':
      if (!v.date) return ''
      return v.date.end ? `${v.date.start} → ${v.date.end}` : v.date.start
    case 'people':
      return (v.people || []).map((p) => p.name || p.id).join(', ')
    case 'checkbox':
      return v.checkbox ? 'true' : 'false'
    case 'url':
      return v.url || ''
    case 'email':
      return v.email || ''
    case 'phone_number':
      return v.phone_number || ''
    case 'created_time':
      return v.created_time || ''
    case 'last_edited_time':
      return v.last_edited_time || ''
    default:
      return ''
  }
}

// Search for both pages and databases the integration can see. Paginates.
async function searchAllObjects(token) {
  const results = []
  let cursor
  let iter = 0
  do {
    const body = { page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const data = await notionFetch(token, '/search', { method: 'POST', body: JSON.stringify(body) })
    results.push(...data.results)
    cursor = data.next_cursor
    iter++
  } while (cursor && iter < SEARCH_ITER_CAP)
  return results
}

// Query rows inside a database. Each row is itself a page but we want their
// properties reflected in the KB entry even if the page body is empty.
async function queryDatabaseRows(token, databaseId) {
  const rows = []
  let cursor
  let iter = 0
  do {
    const body = { page_size: 100 }
    if (cursor) body.start_cursor = cursor
    const data = await notionFetch(token, `/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    rows.push(...data.results)
    cursor = data.next_cursor
    iter++
  } while (cursor && iter < DB_QUERY_ITER_CAP)
  return rows
}

async function upsertDatabase({ admin, tenantId, db }) {
  const title = objectTitle(db)
  const description = titleFromRichText(db.description)
  const content = [
    `Base de datos de Notion: ${title}`,
    description,
    `ID: ${db.id}`,
    db.url ? `URL: ${db.url}` : null,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, PER_DOC_CHAR_CAP)

  const row = {
    tenant_id: tenantId,
    title,
    content,
    project: 'Notion',
    file_type: 'notion_database',
    source: `notion:${db.id}`,
    active: true,
    metadata: { notion_url: db.url, last_edited_time: db.last_edited_time },
  }
  const { error } = await admin
    .from('knowledge_base')
    .upsert(row, { onConflict: 'tenant_id,source' })
  if (error) throw error
}

// Mark previously-synced Notion rows that no longer appear in `liveSources` as inactive.
async function tombstoneMissing({ admin, tenantId, liveSources }) {
  const { data: existing } = await admin
    .from('knowledge_base')
    .select('id, source')
    .eq('tenant_id', tenantId)
    .in('file_type', ['notion_page', 'notion_database', 'notion_database_row'])
    .eq('active', true)
  if (!existing?.length) return 0
  const liveSet = new Set(liveSources)
  const stale = existing.filter((r) => !liveSet.has(r.source))
  if (!stale.length) return 0
  const { error } = await admin
    .from('knowledge_base')
    .update({ active: false })
    .in('id', stale.map((r) => r.id))
  if (error) throw error
  return stale.length
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const isInternal = req.headers['x-internal-sync-token'] === process.env.INTERNAL_SYNC_TOKEN
    const { integrationId } = req.body || {}

    const admin = supabaseAdmin()
    let row

    if (isInternal && integrationId) {
      const { data } = await admin.from('integrations').select('*').eq('id', integrationId).single()
      row = data
    } else {
      const ctx = await getAuthContext(req)
      if (!ctx) return res.status(401).json({ error: 'Not authenticated' })
      const { data } = await admin
        .from('integrations')
        .select('*')
        .eq('tenant_uuid', ctx.tenantId)
        .eq('integration_id', 'notion')
        .single()
      row = data
    }

    if (!row || !row.access_token_encrypted) {
      return res.status(404).json({ error: 'Integration not found or not connected' })
    }

    await admin
      .from('integrations')
      .update({ sync_status: 'syncing', last_error: null })
      .eq('id', row.id)

    const token = decryptToken(row.access_token_encrypted)
    const tenantId = row.tenant_uuid

    const objects = await searchAllObjects(token)
    const databases = objects.filter((o) => o.object === 'database')
    const pages = objects.filter((o) => o.object === 'page')

    const liveSources = []
    let pageCount = 0
    let dbCount = 0
    let dbRowCount = 0
    const errors = []

    // 1. Databases first so their title is known when indexing their rows.
    const dbTitleById = new Map()
    for (const db of databases) {
      try {
        await upsertDatabase({ admin, tenantId, db })
        dbTitleById.set(db.id, objectTitle(db))
        liveSources.push(`notion:${db.id}`)
        dbCount++
      } catch (err) {
        errors.push({ id: db.id, kind: 'database', error: err.message })
      }
    }

    // 2. Standalone pages (not part of a database).
    for (const page of pages) {
      try {
        const title = objectTitle(page)
        const props = propertiesAsText(page.properties)
        const body = await getPageText(token, page.id).catch(() => '')
        const databaseTitle = page.parent?.database_id ? dbTitleById.get(page.parent.database_id) : null
        const content = [databaseTitle ? `Base de datos: ${databaseTitle}` : null, props, body]
          .filter(Boolean)
          .join('\n\n')
          .slice(0, PER_DOC_CHAR_CAP)
        const { error } = await admin.from('knowledge_base').upsert(
          {
            tenant_id: tenantId,
            title,
            content: content || title,
            project: 'Notion',
            file_type: databaseTitle ? 'notion_database_row' : 'notion_page',
            source: `notion:${page.id}`,
            active: true,
            metadata: {
              notion_url: page.url,
              last_edited_time: page.last_edited_time,
              database_id: page.parent?.database_id || null,
            },
          },
          { onConflict: 'tenant_id,source' }
        )
        if (error) throw error
        liveSources.push(`notion:${page.id}`)
        if (databaseTitle) dbRowCount++
        else pageCount++
      } catch (err) {
        errors.push({ id: page.id, kind: 'page', error: err.message?.slice(0, 200) })
      }
    }

    // 3. Rows of databases the integration can read but /search didn't surface
    // (e.g. rows created through a shared parent). Safe to re-upsert: same source key.
    for (const db of databases) {
      try {
        const rows = await queryDatabaseRows(token, db.id)
        const dbTitle = dbTitleById.get(db.id)
        for (const page of rows) {
          if (liveSources.includes(`notion:${page.id}`)) continue
          try {
            const title = objectTitle(page)
            const props = propertiesAsText(page.properties)
            const body = await getPageText(token, page.id).catch(() => '')
            const content = [`Base de datos: ${dbTitle}`, props, body]
              .filter(Boolean)
              .join('\n\n')
              .slice(0, PER_DOC_CHAR_CAP)
            const { error } = await admin.from('knowledge_base').upsert(
              {
                tenant_id: tenantId,
                title,
                content: content || title,
                project: 'Notion',
                file_type: 'notion_database_row',
                source: `notion:${page.id}`,
                active: true,
                metadata: {
                  notion_url: page.url,
                  last_edited_time: page.last_edited_time,
                  database_id: db.id,
                },
              },
              { onConflict: 'tenant_id,source' }
            )
            if (error) throw error
            liveSources.push(`notion:${page.id}`)
            dbRowCount++
          } catch (err) {
            errors.push({ id: page.id, kind: 'db_row', error: err.message?.slice(0, 200) })
          }
        }
      } catch (err) {
        errors.push({ id: db.id, kind: 'database_query', error: err.message?.slice(0, 200) })
      }
    }

    // 4. Tombstone rows that disappeared from Notion since last sync.
    const tombstoned = await tombstoneMissing({ admin, tenantId, liveSources })

    const itemsSynced = pageCount + dbCount + dbRowCount
    await admin
      .from('integrations')
      .update({
        sync_status: errors.length && !itemsSynced ? 'error' : 'idle',
        items_synced: itemsSynced,
        last_sync_at: new Date().toISOString(),
        last_error: errors.length ? `${errors.length} objetos fallaron (ver logs)` : null,
      })
      .eq('id', row.id)

    return res.json({
      ok: true,
      items_synced: itemsSynced,
      breakdown: { pages: pageCount, databases: dbCount, database_rows: dbRowCount },
      tombstoned,
      error_count: errors.length,
      errors: errors.slice(0, 5),
    })
  } catch (err) {
    console.error('notion/sync error:', err)
    try {
      const { integrationId } = req.body || {}
      if (integrationId) {
        await supabaseAdmin()
          .from('integrations')
          .update({ sync_status: 'error', last_error: err.message?.slice(0, 500) })
          .eq('id', integrationId)
      }
    } catch {}
    return res.status(500).json({ error: err.message || 'Sync failed' })
  }
}
