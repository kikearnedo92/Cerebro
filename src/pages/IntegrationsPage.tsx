import React, { useState } from 'react'
import { Plug, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { INTEGRATIONS, Integration } from '@/lib/integrations'
import { useIntegrations } from '@/hooks/useIntegrations'
import IntegrationCard from '@/components/integrations/IntegrationCard'

type CategoryFilter = 'all' | 'knowledge' | 'communication' | 'productivity'

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Todas',
  knowledge: 'Conocimiento',
  communication: 'Comunicación',
  productivity: 'Productividad',
}

export default function IntegrationsPage() {
  const { getStatus, getConnection, connect, disconnect, syncNow, loading } = useIntegrations()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(search.toLowerCase()) ||
      integration.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || integration.category === category
    return matchesSearch && matchesCategory
  })

  const connectedCount = INTEGRATIONS.filter(i => getStatus(i.id) === 'connected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Plug className="w-6 h-6 text-indigo-600" />
            Integraciones
          </h1>
          <p className="text-slate-500 mt-1">
            Conecta tus herramientas para que Cerebro tenga acceso a toda la información de tu empresa.
          </p>
        </div>
        {connectedCount > 0 && (
          <Badge className="bg-green-100 text-green-800 border-green-200 self-start">
            {connectedCount} conectada{connectedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar integración..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
        <p className="text-sm text-indigo-800">
          <strong>¿Cómo funciona?</strong> Cuando conectas una herramienta, Cerebro importa y vectoriza
          el contenido para que tu equipo pueda hacer preguntas al chat y obtener respuestas basadas en
          información real de tu empresa. Tus datos nunca se comparten entre empresas.
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            connection={getConnection(integration.id)}
            status={getStatus(integration.id)}
            onConnect={() => connect(integration.id)}
            onDisconnect={() => disconnect(integration.id)}
            onSync={() => syncNow(integration.id)}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No se encontraron integraciones con ese filtro.</p>
        </div>
      )}

      {/* Coming soon */}
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Próximamente</h2>
        <div className="flex flex-wrap gap-3">
          {['HubSpot', 'Intercom', 'Jira', 'Confluence', 'Zendesk', 'Salesforce', 'Linear', 'GitHub'].map((name) => (
            <span
              key={name}
              className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
