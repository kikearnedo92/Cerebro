// =====================================================================
// Cerebro MCP Server (Model Context Protocol over HTTP/JSON-RPC 2.0)
//
// Wedge for YC RFS Summer 2026: "company brain for AI agents".
// Lets external agents (Claude Desktop, ChatGPT custom GPTs, n8n, Make,
// Zapier via MCP) query Cerebro's indexed context using a tenant API key.
//
// Endpoints:
//   POST /functions/v1/mcp-server  (JSON-RPC envelope)
//
// Methods supported:
//   - initialize
//   - tools/list
//   - tools/call (query_context, list_sources, get_recent_changes)
//   - ping
//
// Auth: Bearer <api_key> in Authorization header. API keys live in
// tenant_api_keys table, hashed with SHA-256.
// =====================================================================

import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

// =====================================================================
// MCP protocol types (subset of MCP spec)
// =====================================================================
interface JsonRpcRequest {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: any
}

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id?: string | number | null
  result?: any
  error?: { code: number; message: string; data?: any }
}

const TOOLS = [
  {
    name: 'query_context',
    description:
      "Search across the company's indexed knowledge (Notion pages, Google Drive docs, Slack messages, etc.) and return the most relevant passages. Use this whenever you need company-specific information that isn't in the model's training data.",
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The natural-language question or topic to search for.',
        },
        limit: {
          type: 'integer',
          description: 'Max number of results to return (default 5, max 20).',
          default: 5,
          minimum: 1,
          maximum: 20,
        },
        sources: {
          type: 'array',
          items: { type: 'string', enum: ['notion', 'google_drive', 'slack', 'gmail', 'manual'] },
          description: 'Optional filter — only return results from these sources.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_sources',
    description:
      'List the integrations currently connected to this Cerebro workspace and how many items each one has indexed.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_recent_changes',
    description:
      'List documents that changed in the last N hours across all connected sources. Useful for daily summaries and catching up on what the team did recently.',
    inputSchema: {
      type: 'object',
      properties: {
        hours: {
          type: 'integer',
          description: 'How many hours back to look (default 24, max 168 = 7 days).',
          default: 24,
          minimum: 1,
          maximum: 168,
        },
      },
    },
  },
]

// =====================================================================
// Crypto: hash API keys with SHA-256 (matches generation logic in UI)
// =====================================================================
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// =====================================================================
// Auth: validate Bearer token against tenant_api_keys
// =====================================================================
async function authenticateApiKey(admin: any, authHeader: string | null): Promise<{ tenantId: string; keyId: string; scopes: string[] } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const apiKey = authHeader.slice(7).trim()
  if (!apiKey.startsWith('cb_live_') && !apiKey.startsWith('cb_test_')) return null

  const keyHash = await sha256Hex(apiKey)
  const { data: row } = await admin
    .from('tenant_api_keys')
    .select('id, tenant_id, scopes, revoked_at, expires_at')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (!row) return null
  if (row.revoked_at) return null
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null

  // Update last_used_at (fire-and-forget)
  admin.from('tenant_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id).then(() => {})

  return { tenantId: row.tenant_id, keyId: row.id, scopes: row.scopes || [] }
}

// =====================================================================
// Tool implementations
// =====================================================================
async function toolQueryContext(admin: any, tenantId: string, params: any) {
  const query = (params?.query || '').toString().trim()
  if (!query) throw new Error('query is required')
  const limit = Math.min(Math.max(parseInt(params?.limit, 10) || 5, 1), 20)
  const sources: string[] | undefined = Array.isArray(params?.sources) ? params.sources : undefined

  // Simple text search via Postgres full-text. Embeddings come in a follow-up sprint.
  let q = admin
    .from('knowledge_base')
    .select('id, title, content, source, file_type, project, metadata, updated_at')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .textSearch('content', query, { type: 'websearch', config: 'english' })
    .limit(limit)

  if (sources && sources.length > 0) {
    q = q.in('source', sources)
  }

  let { data, error } = await q
  // Fallback: if FTS returns nothing, try ilike on title+content
  if ((!data || data.length === 0) && !error) {
    const fallback = admin
      .from('knowledge_base')
      .select('id, title, content, source, file_type, project, metadata, updated_at')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(limit)
    const r = await fallback
    data = r.data
    error = r.error
  }

  if (error) throw new Error(`Search failed: ${error.message}`)

  const passages = (data || []).map((row: any) => ({
    title: row.title,
    source: row.source,
    file_type: row.file_type,
    url: row.metadata?.file_url || null,
    project: row.project,
    last_updated: row.updated_at,
    excerpt: (row.content || '').slice(0, 1500),
  }))

  return {
    content: [
      {
        type: 'text',
        text:
          passages.length === 0
            ? `No matching context found for query: "${query}"`
            : `Found ${passages.length} relevant passage(s):\n\n` +
              passages
                .map(
                  (p: any, i: number) =>
                    `[${i + 1}] ${p.title} (${p.source}${p.url ? ' · ' + p.url : ''})\n${p.excerpt}`
                )
                .join('\n\n---\n\n'),
      },
    ],
    structuredContent: { passages, query },
  }
}

async function toolListSources(admin: any, tenantId: string) {
  const { data, error } = await admin
    .from('integrations')
    .select('integration_id, status, items_synced, last_sync_at')
    .or(`tenant_uuid.eq.${tenantId},tenant_id.eq.${tenantId}`)

  if (error) throw new Error(`List sources failed: ${error.message}`)

  const sources = (data || []).map((row: any) => ({
    source: row.integration_id,
    status: row.status,
    items_indexed: row.items_synced || 0,
    last_synced: row.last_sync_at,
  }))

  return {
    content: [
      {
        type: 'text',
        text:
          sources.length === 0
            ? 'No sources connected yet.'
            : 'Connected sources:\n' +
              sources
                .map(
                  (s: any) =>
                    `- ${s.source}: ${s.status}${s.items_indexed ? ` (${s.items_indexed} items)` : ''}`
                )
                .join('\n'),
      },
    ],
    structuredContent: { sources },
  }
}

async function toolGetRecentChanges(admin: any, tenantId: string, params: any) {
  const hours = Math.min(Math.max(parseInt(params?.hours, 10) || 24, 1), 168)
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString()

  const { data, error } = await admin
    .from('knowledge_base')
    .select('title, source, project, updated_at, metadata')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .gte('updated_at', since)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(`Recent changes failed: ${error.message}`)

  const items = (data || []).map((row: any) => ({
    title: row.title,
    source: row.source,
    project: row.project,
    updated_at: row.updated_at,
    url: row.metadata?.file_url || null,
  }))

  return {
    content: [
      {
        type: 'text',
        text:
          items.length === 0
            ? `No changes in the last ${hours} hour(s).`
            : `${items.length} change(s) in the last ${hours} hour(s):\n` +
              items.map((i: any) => `- ${i.title} (${i.source}, ${new Date(i.updated_at).toLocaleString()})`).join('\n'),
      },
    ],
    structuredContent: { items, hours },
  }
}

// =====================================================================
// Usage logging
// =====================================================================
async function logUsage(admin: any, keyId: string, tenantId: string, toolName: string, query: string, status: string, latencyMs: number, error?: string) {
  try {
    await admin.from('api_key_usage').insert({
      api_key_id: keyId,
      tenant_id: tenantId,
      tool_name: toolName,
      query_text: query.slice(0, 500),
      latency_ms: latencyMs,
      status,
      error_message: error || null,
    })
  } catch (e) {
    console.error('Usage log failed:', e)
  }
}

// =====================================================================
// JSON-RPC dispatcher
// =====================================================================
async function dispatch(admin: any, auth: { tenantId: string; keyId: string; scopes: string[] }, req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const id = req.id ?? null
  try {
    switch (req.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'cerebro-mcp', version: '0.1.0' },
          },
        }

      case 'ping':
        return { jsonrpc: '2.0', id, result: {} }

      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } }

      case 'tools/call': {
        const start = Date.now()
        const toolName = req.params?.name
        const args = req.params?.arguments || {}
        let result: any
        try {
          if (toolName === 'query_context') {
            if (!auth.scopes.includes('query_context')) throw new Error('Scope query_context required')
            result = await toolQueryContext(admin, auth.tenantId, args)
          } else if (toolName === 'list_sources') {
            if (!auth.scopes.includes('list_sources')) throw new Error('Scope list_sources required')
            result = await toolListSources(admin, auth.tenantId)
          } else if (toolName === 'get_recent_changes') {
            result = await toolGetRecentChanges(admin, auth.tenantId, args)
          } else {
            throw new Error(`Unknown tool: ${toolName}`)
          }
          await logUsage(admin, auth.keyId, auth.tenantId, toolName, args.query || '', 'success', Date.now() - start)
          return { jsonrpc: '2.0', id, result }
        } catch (e: any) {
          await logUsage(admin, auth.keyId, auth.tenantId, toolName, args.query || '', 'error', Date.now() - start, e.message)
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32000, message: e.message || 'Tool execution failed' },
          }
        }
      }

      default:
        return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${req.method}` } }
    }
  } catch (e: any) {
    return { jsonrpc: '2.0', id, error: { code: -32603, message: e.message || 'Internal error' } }
  }
}

// =====================================================================
// Main HTTP handler
// =====================================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Authenticate
  const auth = await authenticateApiKey(admin, req.headers.get('Authorization'))
  if (!auth) {
    return new Response(
      JSON.stringify({ jsonrpc: '2.0', error: { code: -32001, message: 'Invalid or missing API key' } }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: JsonRpcRequest | JsonRpcRequest[]
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Support batch requests per JSON-RPC spec
  if (Array.isArray(body)) {
    const responses = await Promise.all(body.map((r) => dispatch(admin, auth, r)))
    return new Response(JSON.stringify(responses), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const response = await dispatch(admin, auth, body)
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
