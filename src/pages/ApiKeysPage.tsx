import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Key, Plus, Copy, Trash2, ExternalLink, AlertCircle, CheckCircle2, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  scopes: string[]
  rate_limit_per_minute: number
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

const ApiKeysPage = () => {
  const { profile, isAdmin, isSuperAdmin } = useAuth()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)

  const tenantId = profile?.tenant_id

  const loadKeys = async () => {
    if (!tenantId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tenant_api_keys')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (!error) setKeys(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin || isSuperAdmin) loadKeys()
  }, [tenantId, isAdmin, isSuperAdmin])

  // Block non-admins. Even if they hit the URL directly, the RLS policy
  // (defined in 20260506_tenant_api_keys.sql) blocks INSERT for non-admins,
  // but better UX to show a clear message.
  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso restringido</h1>
        <p className="text-slate-500 mb-6">
          Las API keys del MCP server solo pueden ser administradas por administradores del workspace.
          Contacta al admin de tu equipo para obtener acceso.
        </p>
        <Link to="/app/chat">
          <Button variant="outline">Volver al chat</Button>
        </Link>
      </div>
    )
  }

  // Generate a random API key client-side, hash it server-side via insert
  const generateKey = async () => {
    if (!newKeyName.trim() || !tenantId) return
    setCreating(true)

    // Generate cryptographically random key: cb_live_<32 random bytes hex>
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    const random = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
    const fullKey = `cb_live_${random}`
    const prefix = fullKey.slice(0, 12) // cb_live_xxxx for display

    // Hash with SHA-256
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fullKey))
    const hash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('')

    const { error } = await supabase.from('tenant_api_keys').insert({
      tenant_id: tenantId,
      name: newKeyName.trim(),
      key_prefix: prefix,
      key_hash: hash,
      scopes: ['query_context', 'list_sources'],
      rate_limit_per_minute: 60,
    })

    if (error) {
      toast({ title: 'Error creando API key', description: error.message, variant: 'destructive' })
      setCreating(false)
      return
    }

    setRevealedKey(fullKey)
    setNewKeyName('')
    setCreating(false)
    loadKeys()
  }

  const revokeKey = async (id: string) => {
    if (!confirm('¿Revocar esta API key? Los agentes que la estén usando dejarán de funcionar.')) return
    const { error } = await supabase
      .from('tenant_api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast({ title: 'Error revocando key', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: 'API key revocada' })
    loadKeys()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado al portapapeles' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-600" />
            API Keys & MCP Server
          </h1>
          <p className="text-slate-500">
            Conecta agentes IA externos (Claude Desktop, ChatGPT, n8n, Make, Zapier) a tu Cerebro
            vía MCP.
          </p>
        </div>
      </div>

      {/* MCP connection info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Endpoint MCP
        </h3>
        <code className="block bg-slate-900 text-emerald-300 text-sm rounded-lg p-3 font-mono">
          https://begnklspqjxwkvwhuefr.supabase.co/functions/v1/mcp-server
        </code>
        <p className="text-xs text-slate-500 mt-2">
          Pega este endpoint + tu API key en cualquier cliente MCP. Documentación:{' '}
          <Link to="/app/mcp-docs" className="text-indigo-600 hover:underline">
            Cómo conectar Claude Desktop, n8n, ChatGPT →
          </Link>
        </p>
      </div>

      {/* Reveal newly created key */}
      {revealedKey && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900">API key creada</h4>
              <p className="text-sm text-emerald-700">
                Cópiala ahora — no la podrás ver de nuevo después de cerrar este aviso.
              </p>
            </div>
            <button onClick={() => setRevealedKey(null)} className="text-slate-400 hover:text-slate-600">
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg p-3 font-mono text-sm">
            <span className="flex-1 break-all">{revealedKey}</span>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(revealedKey)}>
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </Button>
          </div>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-slate-900 mb-3">Crear nueva API key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre (ej: Claude Desktop, n8n production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
          <Button
            onClick={generateKey}
            disabled={!newKeyName.trim() || creating}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Generar
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          La key solo se muestra una vez. Guárdala en un lugar seguro.
        </p>
      </div>

      {/* Existing keys */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900">API keys activas</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No tienes API keys todavía. Crea una arriba para conectar agentes.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {keys.map((k) => (
              <div key={k.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{k.name}</span>
                    {k.revoked_at ? (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Revocada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        Activa
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{k.key_prefix}...</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Creada {new Date(k.created_at).toLocaleDateString()} ·{' '}
                    {k.last_used_at ? `Último uso: ${new Date(k.last_used_at).toLocaleString()}` : 'Sin uso'}
                  </div>
                </div>
                {!k.revoked_at && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revokeKey(k.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Revocar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiKeysPage
