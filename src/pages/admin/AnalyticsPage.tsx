
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  FileText, 
  Clock,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface AnalyticsData {
  totalQueries: number
  activeUsers: number
  totalDocuments: number
  avgResponseTime: number
  popularQueries: Array<{ query: string; count: number }>
  userActivity: Array<{ area: string; queries: number }>
}

const AnalyticsPage = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('📊 Fetching analytics data...')
      
      // Get usage analytics
      const { data: usageData, error: usageError } = await supabase
        .from('usage_analytics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      if (usageError) {
        console.error('Usage analytics error:', usageError)
      }
      
      // Get active users (last 7 days)
      const { data: activeUsersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, last_login, area')
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      if (usersError) {
        console.error('Active users error:', usersError)
      }
      
      // Get knowledge base documents
      const { data: documentsData, error: docsError } = await supabase
        .from('knowledge_base')
        .select('id, title, created_at')
        .eq('active', true)
      
      if (docsError) {
        console.error('Documents error:', docsError)
      }
      
      // Calculate analytics
      const totalQueries = usageData?.length || 0
      const activeUsers = activeUsersData?.length || 0
      const totalDocuments = documentsData?.length || 0
      
      // Group by area
      const areaActivity: { [key: string]: number } = {}
      activeUsersData?.forEach(user => {
        const area = user.area || 'Sin área'
        areaActivity[area] = (areaActivity[area] || 0) + 1
      })
      
      const userActivity = Object.entries(areaActivity).map(([area, queries]) => ({
        area,
        queries
      }))
      
      // Mock popular queries (replace with real data when available)
      const popularQueries = [
        { query: "Políticas de remesas a Colombia", count: Math.floor(totalQueries * 0.2) },
        { query: "Scripts de atención al cliente", count: Math.floor(totalQueries * 0.15) },
        { query: "Procedimientos ATC", count: Math.floor(totalQueries * 0.12) },
        { query: "Regulaciones Chile", count: Math.floor(totalQueries * 0.1) },
        { query: "Compliance Brasil", count: Math.floor(totalQueries * 0.08) }
      ]
      
      setAnalytics({
        totalQueries,
        activeUsers,
        totalDocuments,
        avgResponseTime: 2.3, // Mock for now
        popularQueries,
        userActivity
      })
      
      console.log('✅ Analytics data loaded:', {
        totalQueries,
        activeUsers,
        totalDocuments
      })
      
    } catch (error) {
      console.error('❌ Analytics fetch error:', error)
      setError('Error al cargar analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [user])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics y Métricas
            </h1>
            <p className="text-gray-600">Monitoreo de uso y rendimiento de Cerebro</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalQueries || 0}</p>
                  <p className="text-sm text-gray-600">Consultas (7 días)</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Datos reales</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Última semana</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.avgResponseTime || 0}s</p>
                  <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Estimado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.totalDocuments || 0}</p>
                  <p className="text-sm text-gray-600">Documentos KB</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Activos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Consultas Más Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.popularQueries?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.query}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Activity by Area */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.userActivity?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.area}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${analytics?.activeUsers ? (item.queries / analytics.activeUsers) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {item.queries}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
