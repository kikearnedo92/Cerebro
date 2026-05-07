import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Brain, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

const MCP_ENDPOINT = 'https://begnklspqjxwkvwhuefr.supabase.co/functions/v1/mcp-server'

const CodeBlock = ({ children }: { children: string }) => {
  const copy = () => {
    navigator.clipboard.writeText(children)
    toast({ title: 'Copiado' })
  }
  return (
    <div className="relative bg-slate-900 rounded-lg my-3">
      <pre className="text-emerald-300 text-xs p-4 overflow-x-auto font-mono">{children}</pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

const McpDocsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/app/api-keys" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Volver a API Keys
      </Link>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Conectar Cerebro a tus agentes IA</h1>
      <p className="text-slate-500 mb-8">
        Cerebro expone un servidor MCP (Model Context Protocol). Cualquier cliente compatible
        puede consultar el contexto de tu empresa con una API key.
      </p>

      {/* Endpoint */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-slate-900 mb-2">Endpoint</h2>
        <code className="block bg-slate-900 text-emerald-300 text-sm rounded-lg p-3 font-mono break-all">
          {MCP_ENDPOINT}
        </code>
        <p className="text-xs text-slate-500 mt-2">
          Auth: <code className="bg-slate-200 px-1 rounded">Authorization: Bearer cb_live_...</code>
        </p>
      </div>

      {/* Tools */}
      <h2 className="text-xl font-semibold text-slate-900 mb-3">Herramientas disponibles</h2>
      <ul className="space-y-3 mb-8 text-sm">
        <li className="border border-slate-200 rounded-lg p-4">
          <code className="text-indigo-600 font-mono">query_context(query, limit?, sources?)</code>
          <p className="text-slate-600 mt-1">
            Búsqueda semántica/textual sobre toda la información indexada (Notion, Drive, Slack...).
          </p>
        </li>
        <li className="border border-slate-200 rounded-lg p-4">
          <code className="text-indigo-600 font-mono">list_sources()</code>
          <p className="text-slate-600 mt-1">
            Lista las integraciones conectadas y cuántos elementos tiene cada una.
          </p>
        </li>
        <li className="border border-slate-200 rounded-lg p-4">
          <code className="text-indigo-600 font-mono">get_recent_changes(hours?)</code>
          <p className="text-slate-600 mt-1">
            Documentos modificados en las últimas N horas (útil para resúmenes diarios).
          </p>
        </li>
      </ul>

      {/* Claude Desktop */}
      <h2 className="text-xl font-semibold text-slate-900 mb-3">Claude Desktop</h2>
      <p className="text-slate-500 text-sm mb-2">
        Edita <code className="bg-slate-100 px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code> y agrega:
      </p>
      <CodeBlock>{`{
  "mcpServers": {
    "cerebro": {
      "url": "${MCP_ENDPOINT}",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer cb_live_TU_API_KEY"
      }
    }
  }
}`}</CodeBlock>

      {/* n8n */}
      <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">n8n</h2>
      <p className="text-slate-500 text-sm mb-2">
        Usa el nodo <strong>HTTP Request</strong> con método POST. Body de ejemplo:
      </p>
      <CodeBlock>{`POST ${MCP_ENDPOINT}
Authorization: Bearer cb_live_TU_API_KEY
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query_context",
    "arguments": {
      "query": "política de devoluciones",
      "limit": 5
    }
  }
}`}</CodeBlock>

      {/* curl */}
      <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">Probar con curl</h2>
      <CodeBlock>{`curl -X POST ${MCP_ENDPOINT} \\
  -H "Authorization: Bearer cb_live_TU_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'`}</CodeBlock>

      {/* ChatGPT custom GPT */}
      <h2 className="text-xl font-semibold text-slate-900 mb-3 mt-8">ChatGPT (Custom GPT con Action)</h2>
      <p className="text-slate-500 text-sm mb-3">
        En GPT Builder → Configure → Add Action → pega esta OpenAPI spec mínima:
      </p>
      <CodeBlock>{`openapi: 3.0.0
info:
  title: Cerebro Context
  version: '0.1'
servers:
  - url: ${MCP_ENDPOINT.replace('/mcp-server', '')}
paths:
  /mcp-server:
    post:
      operationId: callMcpTool
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '200':
          description: OK
components:
  securitySchemes:
    bearer:
      type: http
      scheme: bearer
security:
  - bearer: []`}</CodeBlock>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mt-10 flex items-start gap-3">
        <Brain className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-sm text-slate-700">
          <strong className="text-slate-900">¿Algo no funciona?</strong> El endpoint MCP está
          versión inicial. Si necesitas otro transport (SSE, websocket) o un cliente que no aparece
          arriba, escríbenos a{' '}
          <a href="mailto:hola@usacerebro.com" className="text-indigo-600 underline">
            hola@usacerebro.com
          </a>{' '}
          y lo agregamos.
        </div>
      </div>
    </div>
  )
}

export default McpDocsPage
