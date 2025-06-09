
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  ClockIcon,
  TrendingUpIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

const AnalyticsPage = () => {
  const { isAdmin } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Real analytics data fetching
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching real analytics data...')

      // Get queries from last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      // Total queries
      const { data: totalQueries, error: queriesError } = await supabase
        .from('usage_analytics')
        .select('id, created_at, query')
        .gte('created_at', thirtyDaysAgo)

      if (queriesError) throw queriesError

      // Active users (logged in last 7 days)
      const { data: activeUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, last_login, email')
        .gte('last_login', sevenDaysAgo)

      if (usersError) throw usersError

      // Total documents
      const { data: documents, error: docsError } = await supabase
        .from('knowledge_base')
        .select('id, title, project')
        .eq('active', true)

      if (docsError) throw docsError

      // Recent queries for frequency analysis
      const { data: recentQueries, error: recentError } = await supabase
        .from('usage_analytics')
        .select('query, created_at')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(50)

      if (recentError) throw recentError

      // Process daily usage data
      const dailyUsage = processDialyUsage(totalQueries || [])
      
      // Process query frequency
      const queryFrequency = processQueryFrequency(recentQueries || [])

      console.log('✅ Analytics data loaded:', {
        totalQueries: totalQueries?.length || 0,
        activeUsers: activeUsers?.length || 0,
        documents: documents?.length || 0
      })

      setAnalytics({
        totalQueries: totalQueries?.length || 0,
        activeUsers: activeUsers?.length || 0,
        totalDocuments: documents?.length || 0,
        dailyUsage,
        recentQueries: recentQueries || [],
        queryFrequency,
        // NO fake satisfaction data
      })

    } catch (error) {
      console.error('Analytics fetch error:', error)
      setError(error.message)
      toast({
        title: "Error",
        description: `Error cargando analytics: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const processDialyUsage = (queries) => {
    const dailyData = {}
    queries.forEach(query => {
      const date = new Date(query.created_at).toISOString().split('T')[0]
      dailyData[date] = (dailyData[date] || 0) + 1
    })

    return Object.entries(dailyData)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        queries: count
      }))
      .slice(-7) // Last 7 days
  }

  const processQueryFrequency = (queries) => {
    const frequency = {}
    queries.forEach(query => {
      const q = query.query.toLowerCase().trim()
      frequency[q] = (frequency[q] || 0) + 1
    })

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))
  }

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden ver analytics</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="analytics-page h-full overflow-y-auto">
      <div className="analytics-content space-y-6 p-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6" />
              Analytics
            </h1>
            <p className="text-gray-600">Métricas de uso y rendimiento de Cerebro</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Stats Cards - ONLY REAL DATA */}
        <div className="analytics-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Totales</CardTitle>
              <QuestionMarkCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalQueries || 0}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Activos</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalDocuments || 0}</div>
              <p className="text-xs text-muted-foreground">En knowledge base</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Uso Diario</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.dailyUsage || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="queries" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Query Types */}
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {analytics?.queryFrequency?.length > 0 ? (
                  analytics.queryFrequency.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                        {item.query.length > 50 ? `${item.query.substring(0, 50)}...` : item.query}
                      </span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay datos suficientes</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consulta</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.recentQueries?.slice(0, 10).map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-md">
                      <span className="truncate block">
                        {query.query.length > 80 ? `${query.query.substring(0, 80)}...` : query.query}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(query.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      No hay actividad reciente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
