
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { MessageSquare, Users, FileText, TrendingUp, Calendar, Clock, ThumbsUp, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface AnalyticsData {
  totalQueries: number
  totalUsers: number
  totalDocuments: number
  activeUsers: number
  dailyQueries: { date: string; queries: number }[]
  topQuestions: { question: string; count: number }[]
  userDistribution: { area: string; users: number }[]
  satisfactionRating: number
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Fetching analytics data...')

      // Fetch queries from usage_analytics
      const { data: queries, error: queriesError } = await supabase
        .from('usage_analytics')
        .select('*')

      if (queriesError) {
        console.error('Queries fetch error:', queriesError)
      }

      // Fetch users from profiles
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('area, last_login, created_at')

      if (usersError) {
        console.error('Users fetch error:', usersError)
      }

      // Fetch knowledge base items
      const { data: documents, error: documentsError } = await supabase
        .from('knowledge_base')
        .select('id, active')

      if (documentsError) {
        console.error('Documents fetch error:', documentsError)
      }

      // Process analytics data
      const totalQueries = queries?.length || 0
      const totalUsers = users?.length || 0
      const totalDocuments = documents?.filter(d => d.active)?.length || 0
      
      // Active users (logged in last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const activeUsers = users?.filter(u => 
        u.last_login && new Date(u.last_login) > weekAgo
      )?.length || 0

      // Daily queries for last 7 days
      const dailyQueries = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayQueries = queries?.filter(q => 
          new Date(q.created_at).toISOString().split('T')[0] === dateStr
        )?.length || 0

        dailyQueries.push({
          date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          queries: dayQueries
        })
      }

      // User distribution by area
      const areaCount: { [key: string]: number } = {}
      users?.forEach(user => {
        if (user.area) {
          areaCount[user.area] = (areaCount[user.area] || 0) + 1
        }
      })

      const userDistribution = Object.entries(areaCount).map(([area, count]) => ({
        area,
        users: count
      }))

      // Mock top questions and satisfaction for now
      const topQuestions = [
        { question: "Políticas de ATC", count: Math.floor(totalQueries * 0.3) },
        { question: "Procedimientos por país", count: Math.floor(totalQueries * 0.25) },
        { question: "Scripts de respuesta", count: Math.floor(totalQueries * 0.2) },
        { question: "Normativas compliance", count: Math.floor(totalQueries * 0.15) },
        { question: "Documentación técnica", count: Math.floor(totalQueries * 0.1) }
      ]

      const analyticsData: AnalyticsData = {
        totalQueries,
        totalUsers,
        totalDocuments,
        activeUsers,
        dailyQueries,
        topQuestions,
        userDistribution,
        satisfactionRating: 87 // Mock satisfaction rating
      }

      console.log('✅ Analytics data processed:', analyticsData)
      setAnalytics(analyticsData)

    } catch (error) {
      console.error('Analytics fetch failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "Error",
        description: `Error cargando analytics: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Cargando analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-900">Error al cargar analytics</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <Button onClick={fetchAnalytics} className="mt-4" variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Métricas de uso de Cerebro</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Consultas Totales</p>
                <p className="text-2xl font-bold">{analytics.totalQueries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                <p className="text-xs text-gray-500">de {analytics.totalUsers} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Documentos</p>
                <p className="text-2xl font-bold">{analytics.totalDocuments}</p>
                <p className="text-xs text-gray-500">activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-2xl font-bold">{analytics.satisfactionRating}%</p>
                <p className="text-xs text-gray-500">promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Consultas por Día (Última Semana)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyQueries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="queries" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribución por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ area, percent }) => `${area} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {analytics.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-500">
                <p>No hay datos de distribución</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Preguntas Más Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topQuestions.length > 0 ? (
            <div className="space-y-4">
              {analytics.topQuestions.map((question, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <span className="font-medium">{question.question}</span>
                  </div>
                  <Badge variant="secondary">{question.count} consultas</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay datos de preguntas frecuentes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
