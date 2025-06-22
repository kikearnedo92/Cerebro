
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInsightsData } from '@/hooks/useInsightsData'
import { ConversationInsights } from './ConversationInsights'
import { ChurnAnalysis } from './ChurnAnalysis'
import { ImprovementSuggestions } from './ImprovementSuggestions'
import { MetricsOverview } from './MetricsOverview'
import { Loader2, Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

export const InsightsDashboard = () => {
  const { data, loading, error, refetch, updateSuggestionStatus } = useInsightsData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando insights...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar insights</h3>
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
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            Cerebro Insights
          </h1>
          <p className="text-gray-600 mt-1">
            Inteligencia de producto para mejora continua automatizada
          </p>
        </div>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Métricas Overview */}
      <MetricsOverview data={data} />

      {/* Tabs de Insights */}
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversations" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Análisis de Conversaciones
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predicción de Churn
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Mejoras Sugeridas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <ConversationInsights data={data.conversationAnalytics} />
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <ChurnAnalysis data={data.churnPredictions} />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <ImprovementSuggestions 
            data={data.improvementSuggestions} 
            onUpdateStatus={updateSuggestionStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
