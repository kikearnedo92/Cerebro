
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, MessageSquare, TrendingUp, Clock, Brain, Zap, Database } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface CerebroMetrics {
  totalUsers: number
  activeSessions: number
  totalQueries: number
  avgResponseTime: number
  successRate: number
  topQueries: Array<{ query: string; count: number }>
  userEngagement: {
    daily: number
    weekly: number
    monthly: number
  }
  knowledgeBaseUsage: {
    documentsQueried: number
    avgDocumentsPerQuery: number
    topCategories: Array<{ category: string; usage: number }>
  }
}

export const CerebroRealAnalytics = () => {
  const [metrics, setMetrics] = useState<CerebroMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchRealMetrics = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching real CEREBRO analytics...')

      const { data, error } = await supabase.functions.invoke('cerebro-real-analytics', {
        body: { timeframe: '30d' }
      })

      if (error) throw error

      setMetrics(data.metrics)
      setLastUpdate(new Date())
      console.log('✅ Real analytics loaded successfully')

    } catch (err) {
      console.error('❌ Error fetching real analytics:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({
        title: "Error",
        description: "No se pudieron cargar las métricas reales",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRealMetrics()
    
    // Update metrics every 5 minutes
    const interval = setInterval(fetchRealMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas reales de CEREBRO...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchRealMetrics} variant="outline">Reintentar</Button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">CEREBRO Analytics</h1>
            <p className="text-gray-600">Métricas reales de uso interno</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            En Vivo
          </Badge>
          <Button onClick={fetchRealMetrics} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% este mes</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sesiones Activas</p>
                <p className="text-2xl font-bold">{metrics.activeSessions}</p>
                <p className="text-sm text-blue-600">En tiempo real</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Queries Totales</p>
                <p className="text-2xl font-bold">{metrics.totalQueries.toLocaleString()}</p>
                <p className="text-sm text-purple-600">Últimos 30 días</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold">{metrics.avgResponseTime}s</p>
                <p className="text-sm text-orange-600">Promedio</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usuarios Diarios</span>
                <span className="text-lg font-semibold">{metrics.userEngagement.daily}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usuarios Semanales</span>
                <span className="text-lg font-semibold">{metrics.userEngagement.weekly}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Usuarios Mensuales</span>
                <span className="text-lg font-semibold">{metrics.userEngagement.monthly}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium">Tasa de Éxito</span>
                <span className="text-lg font-semibold text-green-600">{metrics.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Uso de Base de Conocimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Documentos Consultados</span>
                <span className="text-lg font-semibold">{metrics.knowledgeBaseUsage.documentsQueried}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Promedio por Query</span>
                <span className="text-lg font-semibold">{metrics.knowledgeBaseUsage.avgDocumentsPerQuery}</span>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Categorías Más Usadas:</span>
                {metrics.knowledgeBaseUsage.topCategories.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{cat.category}</span>
                    <Badge variant="outline" className="text-xs">{cat.usage}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Queries Más Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.topQueries.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                    {index + 1}
                  </div>
                  <span className="text-sm">{query.query}</span>
                </div>
                <Badge variant="outline">{query.count} veces</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-center text-sm text-gray-500">
          Última actualización: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  )
}
