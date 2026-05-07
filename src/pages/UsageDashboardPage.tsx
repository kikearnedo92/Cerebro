import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Database, BarChart3, Clock, FileText, TrendingUp, Users as UsersIcon, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface KbStats {
  total_docs: number
  embedded_docs: number
  by_source: Record<string, number>
  recent_24h: number
}

interface ApiUsageStats {
  total_calls: number
  calls_24h: number
  calls_7d: number
  by_tool: Record<string, number>
  by_status: Record<string, number>
  avg_latency_ms: number | null
}

const UsageDashboardPage = () => {
  const { profile, isAdmin, isSuperAdmin } = useAuth()
  const [kb, setKb] = useState<KbStats | null>(null)
  const [api, setApi] = useState<ApiUsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (!(isAdmin || isSuperAdmin) || !tenantId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [kbRes, apiRes] = await Promise.all([
        supabase.rpc('tenant_kb_stats', { p_tenant_id: tenantId }),
        supabase.rpc('tenant_api_usage_stats', { p_tenant_id: tenantId }),
      ])
      if (cancelled) return
      if (kbRes.data?.[0]) setKb({
        total_docs: Number(kbRes.data[0].total_docs || 0),
        embedded_docs: Number(kbRes.data[0].embedded_docs || 0),
        by_source: kbRes.data[0].by_source || {},
        recent_24h: Number(kbRes.data[0].recent_24h || 0),
      })
      if (apiRes.data?.[0]) setApi({
        total_calls: Number(apiRes.data[0].total_calls || 0),
        calls_24h: Number(apiRes.data[0].calls_24h || 0),
        calls_7d: Number(apiRes.data[0].calls_7d || 0),
        by_tool: apiRes.data[0].by_tool || {},
        by_status: apiRes.data[0].by_status || {},
        avg_latency_ms: apiRes.data[0].avg_latency_ms,
      })
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [tenantId, isAdmin, isSuperAdmin])

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso restringido</h1>
        <p className="text-slate-500 mb-6">
          El dashboard de uso solo está disponible para administradores del workspace.
        </p>
        <Link to="/app/chat"><Button variant="outline">Volver al chat</Button></Link>
      </div>
    )
  }

  if (loading) {
    return <div className="p-8 text-slate-500 text-center">Cargando estadísticas...</div>
  }

  const embedPct = kb && kb.total_docs > 0 ? Math.round((kb.embedded_docs / kb.total_docs) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Uso del workspace
        </h1>
        <p className="text-slate-500">
          Métricas de tu base de conocimiento y consumo de API. Actualizado en tiempo real.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<FileText className="w-5 h-5" />}
          label="Documentos indexados"
          value={kb?.total_docs ?? 0}
          subtitle={`${kb?.recent_24h ?? 0} en últimas 24h`}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Cobertura semántica"
          value={`${embedPct}%`}
          subtitle={`${kb?.embedded_docs ?? 0} embeddings listos`}
        />
        <MetricCard
          icon={<UsersIcon className="w-5 h-5" />}
          label="Llamadas API (7d)"
          value={api?.calls_7d ?? 0}
          subtitle={`${api?.calls_24h ?? 0} en últimas 24h`}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" />}
          label="Latencia promedio API"
          value={api?.avg_latency_ms ? `${Math.round(Number(api.avg_latency_ms))}ms` : '—'}
          subtitle="Por consulta MCP"
        />
      </div>

      {/* By source */}
      <Section title="Documentos por fuente" icon={<Database className="w-5 h-5" />}>
        {kb && Object.keys(kb.by_source).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(kb.by_source)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([source, count]) => (
                <BarRow
                  key={source}
                  label={sourceLabel(source)}
                  value={Number(count)}
                  max={kb.total_docs}
                />
              ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Aún no hay documentos. Conecta una integración para empezar.</p>
        )}
      </Section>

      {/* By tool */}
      <Section title="Llamadas API por herramienta" icon={<BarChart3 className="w-5 h-5" />}>
        {api && Object.keys(api.by_tool).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(api.by_tool)
              .sort(([, a], [, b]) => Number(b) - Number(a))
              .map(([tool, count]) => (
                <BarRow
                  key={tool}
                  label={tool}
                  value={Number(count)}
                  max={api.total_calls}
                />
              ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            Aún no hay llamadas al MCP server. Crea una API key en{' '}
            <Link to="/app/api-keys" className="text-indigo-600 hover:underline">API Keys & MCP</Link>{' '}
            y conecta un agente.
          </p>
        )}
      </Section>

      {/* Status breakdown */}
      {api && Object.keys(api.by_status).length > 0 && (
        <Section title="Estado de llamadas" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(api.by_status).map(([status, count]) => (
              <Badge
                key={status}
                variant="outline"
                className={
                  status === 'success' ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                  : status === 'error' ? 'text-red-700 border-red-200 bg-red-50'
                  : 'text-slate-700'
                }
              >
                {status}: {Number(count)}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; subtitle?: string }> = ({ icon, label, value, subtitle }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4">
    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
  </div>
)

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
    <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h2>
    {children}
  </section>
)

const BarRow: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500 text-xs">{value} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function sourceLabel(s: string): string {
  return ({
    google_drive: 'Google Drive',
    notion: 'Notion',
    slack: 'Slack',
    gmail: 'Gmail',
    manual: 'Subidos manualmente',
  } as Record<string, string>)[s] || s
}

export default UsageDashboardPage
