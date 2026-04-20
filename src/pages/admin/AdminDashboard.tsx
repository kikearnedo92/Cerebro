import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Database, Brain, ArrowLeft, Building2, CreditCard, Activity, Loader2, RefreshCw, Pause, Play } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

type TenantRow = {
  id: string
  name: string
  subdomain: string
  plan: string
  subscription_status: string
  subscription_active: boolean
  is_internal: boolean
  users_count: number | null
  integrations_count: number | null
  docs_count: number | null
  trial_ends_at: string | null
  created_at: string
}

type Summary = {
  total_tenants: number
  active_tenants: number
  internal_tenants: number
  total_users: number | null
  total_docs: number
}

const planPrice: Record<string, number> = { starter: 49, growth: 99, enterprise: 299 }

const AdminDashboard = () => {
  const { profile, isSuperAdmin, session } = useAuth() as any
  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actingOn, setActingOn] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session?.access_token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/tenants', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setTenants(data.tenants || [])
      setSummary(data.summary || null)
    } catch (e: any) {
      setError(e.message || 'Error al cargar tenants')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    if (isSuperAdmin) load()
  }, [isSuperAdmin, load])

  const togglePause = async (t: TenantRow) => {
    const nextStatus = t.subscription_status === 'paused' ? 'trial' : 'paused'
    setActingOn(t.id)
    try {
      const res = await fetch(`/api/admin/tenants?id=${t.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription_status: nextStatus }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      await load()
    } catch (e: any) {
      setError(e.message || 'Error al actualizar tenant')
    } finally {
      setActingOn(null)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Acceso Denegado</h3>
          <p className="text-slate-500">Solo super administradores pueden acceder.</p>
          <Link to="/app">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 w-4 h-4" /> Volver a la app
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const mrr = tenants
    .filter((t) => t.subscription_active && !t.is_internal)
    .reduce((s, t) => s + (planPrice[t.plan] || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
              <p className="text-slate-500 text-sm">Gestión global de Cerebro SaaS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-1 w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </Button>
            <Link to="/app">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1 w-4 h-4" /> Volver a la app
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Tenants" value={summary?.total_tenants ?? '--'} hint={`${summary?.active_tenants ?? 0} activos`} icon={<Building2 className="w-8 h-8 text-indigo-400" />} />
          <StatCard label="Usuarios" value={summary?.total_users ?? '--'} hint="Total registrados" icon={<Users className="w-8 h-8 text-emerald-400" />} />
          <StatCard label="MRR estimado" value={`$${mrr}`} hint="Tenants con subscripción activa" icon={<CreditCard className="w-8 h-8 text-amber-400" />} />
          <StatCard label="Docs indexados" value={summary?.total_docs ?? '--'} hint="En knowledge_base" icon={<Activity className="w-8 h-8 text-violet-400" />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Empresas registradas ({tenants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && tenants.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Cargando tenants...</p>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Sin empresas aún</p>
                <p className="text-sm">Los tenants aparecerán aquí cuando los primeros clientes se registren.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="py-2 pr-4">Nombre</th>
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2 pr-4">Users</th>
                      <th className="py-2 pr-4">Docs</th>
                      <th className="py-2 pr-4">Integraciones</th>
                      <th className="py-2 pr-4">Creado</th>
                      <th className="py-2 pr-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-400">{t.subdomain}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="capitalize">{t.plan}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={t.subscription_status} isInternal={t.is_internal} />
                        </td>
                        <td className="py-3 pr-4">{t.users_count ?? '--'}</td>
                        <td className="py-3 pr-4">{t.docs_count ?? 0}</td>
                        <td className="py-3 pr-4">{t.integrations_count ?? 0}</td>
                        <td className="py-3 pr-4 text-xs text-slate-500">
                          {new Date(t.created_at).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3 pr-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePause(t)}
                            disabled={actingOn === t.id}
                          >
                            {actingOn === t.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : t.subscription_status === 'paused' ? (
                              <><Play className="w-3 h-3 mr-1" /> Reactivar</>
                            ) : (
                              <><Pause className="w-3 h-3 mr-1" /> Pausar</>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <QuickLink label="Supabase" href="https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr" hint="Base de datos y auth" />
            <QuickLink label="Vercel" href="https://vercel.com/kikearnedo92s-projects/cerebro" hint="Deploys y logs" />
            <QuickLink label="Anthropic" href="https://console.anthropic.com" hint="Uso de API Claude" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint: string; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{hint}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status, isInternal }: { status: string; isInternal: boolean }) => {
  if (isInternal) return <Badge className="bg-slate-200 text-slate-700">Interno</Badge>
  const map: Record<string, string> = {
    trial: 'bg-blue-100 text-blue-700',
    active: 'bg-emerald-100 text-emerald-700',
    paused: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-slate-200 text-slate-600',
  }
  return <Badge className={map[status] || 'bg-slate-100 text-slate-700'}>{status}</Badge>
}

const QuickLink = ({ label, href, hint }: { label: string; href: string; hint: string }) => (
  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
    <h3 className="font-medium text-slate-900 mb-1">{label}</h3>
    <p className="text-sm text-slate-500 mb-3">{hint}</p>
    <Button variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">Abrir {label}</a>
    </Button>
  </div>
)

export default AdminDashboard
