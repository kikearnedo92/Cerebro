
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAutoDevData } from '@/hooks/useAutoDevData'
import { CodeGenerationQueue } from './CodeGenerationQueue'
import { AutomationPipelines } from './AutomationPipelines'
import { APIIntegrations } from './APIIntegrations'
import { AutoDevMetrics } from './AutoDevMetrics'
import { ImprovementRoadmap } from './ImprovementRoadmap'
import { Loader2, Zap, Code, Settings, GitBranch, Workflow, Rocket } from 'lucide-react'

export const AutoDevDashboard = () => {
  const { data, apiIntegrations, loading, error, refetch, triggerCodeGeneration, togglePipeline, retryFailedGeneration } = useAutoDevData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando AutoDev...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar AutoDev</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            Cerebro AutoDev
          </h1>
          <p className="text-gray-600 mt-1">
            Mejora continua automatizada con IA - Pipeline de generación de código
          </p>
        </div>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center"
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Métricas Overview */}
      <AutoDevMetrics data={data} />

      {/* Status de APIs */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Estado de Integraciones API
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {apiIntegrations.map((api) => (
            <div key={api.id} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                api.status === 'connected' ? 'bg-green-500' : 
                api.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">{api.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs de AutoDev */}
      <Tabs defaultValue="roadmap" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roadmap" className="flex items-center">
            <Rocket className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Cola de Generación
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="flex items-center">
            <Workflow className="h-4 w-4 mr-2" />
            Pipelines
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            APIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="space-y-4">
          <ImprovementRoadmap />
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <CodeGenerationQueue 
            data={data.codeGenerations} 
            onTriggerGeneration={triggerCodeGeneration}
            onRetryGeneration={retryFailedGeneration}
          />
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <AutomationPipelines 
            data={data.automationPipelines} 
            onTogglePipeline={togglePipeline}
          />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <APIIntegrations data={apiIntegrations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
