// POST /api/integrations/notion/sync
// Pulls pages from the user's Notion, extracts plain text, and upserts into
// knowledge_base with source='notion:<page_id>'. Chat retrieval today uses
// text-based search_knowledge_semantic; vector embeddings are Day-1 follow-up.
// Can be called:
//  - By the callback (fire-and-forget after successful OAuth)
//  - Manually by the user clicking "Re-sync"
//  - By the Vercel cron (future)
import { getAuthContext, supabaseAdmin } from '../_lib/supabase.js'
import { decryptToken } from '../_lib/crypto.js'

const NOTION_API = 'https://api.notion.com/v1'

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

// Recursively walk a page's blocks and concatenate text
async function getPageText(token, pageId) {
  let text = ''
  let cursor
  let iter = 0
  do {
    const data = await notionFetch(token, `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`)
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
  } while (cursor && iter < 20) // safety cap
  return text.trim()
}

function extractBlockText(block) {
  const type = block.type
  const payload = block[type]
  if (!payload) return ''
  const rt = payload.rich_text || payload.text || []
  return rt.map((t) => t.plain_text || '').join('')
}

async function searchPages(token) {
  const results = []
  let cursor
  let iter = 0
  do {
    const body = {
      page_size: 50,
      filter: { value: 'page', property: 'object' },
    }
    if (cursor) body.start_cursor = cursor
    const data = await notionFetch(token, '/search', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    results.push(...data.results)
    cursor = data.next_cursor
    iter++
  } while (cursor && iter < 10) // cap: 500 pages
  return results
}

function pageTitle(page) {
  const props = page.properties || {}
  for (const v of Object.values(props)) {
    if (v?.type === 'title') {
      return (v.title || []).map((t) => t.plain_text).join('') || 'Sin título'
    }
  }
  return 'Sin título'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Allow two auth modes: user session or internal sync token
    const isInternal = req.headers['x-internal-sync-token'] === process.env.INTERNAL_SYNC_TOKEN
    let integrationId = req.body?.integrationId

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

    // Mark as syncing
    await admin.from('integrations').update({ sync_status: 'syncing', last_error: null }).eq('id', row.id)

    const token = decryptToken(row.access_token_encrypted)
    const pages = await searchPages(token)

    let count = 0
    for (const page of pages) {
      try {
        const title = pageTitle(page)
        const text = await getPageText(token, page.id)
        const content = `${title}\n\n${text}`.slice(0, 30000) // cap per doc

        await admin.from('knowledge_base').upsert(
          {
            tenant_id: row.tenant_uuid,
            title,
            content,
            project: 'Notion',
            file_type: 'notion_page',
            source: `notion:${page.id}`,
            active: true,
          },
          { onConflict: 'source' }
        )
        count++
      } catch (err) {
        console.warn(`Skipping Notion page ${page.id}:`, err.message)
      }
    }

    await admin
      .from('integrations')
      .update({
        sync_status: 'idle',
        items_synced: count,
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', row.id)

    return res.json({ ok: true, items_synced: count })
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
