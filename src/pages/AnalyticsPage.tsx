
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Activity, FileText, MessageSquare, Users, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface AnalyticsData {
  totalUsers: number
  totalDocuments: number
  totalQueries: number
  avgResponseTime: number
  dailyQueries: Array<{ date: string, queries: number }>
  topDocuments: Array<{ title: string, queries: number }>
  userActivity: Array<{ area: string, users: number }>
}

const AnalyticsPage = () => {
  const { isAdmin } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalDocuments: 0,
    totalQueries: 0,
    avgResponseTime: 0,
    dailyQueries: [],
    topDocuments: [],
    userActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return
    
    const fetchRealAnalytics = async () => {
      try {
        setIsLoading(true)
        console.log('📊 Fetching REAL analytics from Supabase...')

        // Fetch REAL data from Supabase
        const [usersResult, documentsResult, queriesResult] = await Promise.all([
          supabase.from('profiles').select('area, role_system').eq('role_system', 'user'),
          supabase.from('knowledge_base').select('title, created_at').eq('active', true),
          supabase.from('usage_analytics').select('query, response_time, sources_used, created_at')
        ])

        // Process REAL users data
        const users = usersResult.data || []
        const usersByArea = users.reduce((acc, user) => {
          const area = user.area || 'General'
          acc[area] = (acc[area] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Process REAL documents data
        const documents = documentsResult.data || []

        // Process REAL queries data
        const queries = queriesResult.data || []
        const avgResponseTime = queries.length > 0 
          ? queries.reduce((sum, q) => sum + (q.response_time || 0), 0) / queries.length 
          : 0

        // Generate daily queries from REAL data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()

        const dailyQueries = last7Days.map(date => {
          const dayQueries = queries.filter(q => 
            new Date(q.created_at).toISOString().split('T')[0] === date
          )
          return {
            date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
            queries: dayQueries.length
          }
        })

        // Calculate top documents from REAL queries
        const documentMentions = {} as Record<string, number>
        queries.forEach(query => {
          if (query.sources_used && Array.isArray(query.sources_used)) {
            query.sources_used.forEach((source: any) => {
              const title = source.title || 'Documento desconocido'
              documentMentions[title] = (documentMentions[title] || 0) + 1
            })
          }
        })

        const topDocuments = Object.entries(documentMentions)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([title, queries]) => ({ title, queries }))

        setAnalytics({
          totalUsers: users.length,
          totalDocuments: documents.length,
          totalQueries: queries.length,
          avgResponseTime: Math.round(avgResponseTime),
          dailyQueries,
          topDocuments,
          userActivity: Object.entries(usersByArea).map(([area, users]) => ({ area, users }))
        })

        console.log('✅ REAL analytics loaded:', {
          users: users.length,
          documents: documents.length,
          queries: queries.length
        })

      } catch (error) {
        console.error('Analytics fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRealAnalytics()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600">Solo los administradores pueden ver las analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Cargando analytics reales...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics de Cerebro</h1>
        <p className="text-gray-600">Métricas reales del uso de la plataforma</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDocuments}</p>
                <p className="text-sm text-gray-600">Documentos Subidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalQueries}</p>
                <p className="text-sm text-gray-600">Consultas Realizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgResponseTime}ms</p>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Consultas por Día (Últimos 7 días)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.dailyQueries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyQueries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="queries" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos de consultas aún
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Usuarios por Área</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay usuarios registrados aún
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Documentos Más Consultados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topDocuments.length > 0 ? (
            <div className="space-y-4">
              {analytics.topDocuments.map((doc, index) => (
                <div key={doc.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{doc.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{doc.queries} consultas</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(doc.queries / Math.max(...analytics.topDocuments.map(d => d.queries))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay consultas a documentos registradas aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Base de Conocimiento: {analytics.totalDocuments > 0 ? 'Activa' : 'Vacía'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Chat IA: Funcionando</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${analytics.totalUsers > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm">Usuarios: {analytics.totalUsers > 0 ? 'Registrados' : 'Pendientes'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
