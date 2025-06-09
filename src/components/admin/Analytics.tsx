
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, MessageSquare, Database, TrendingUp, Clock, FileText, Activity } from 'lucide-react'

const Analytics = () => {
  // Fetch usage analytics
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_analytics')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })

  // Fetch knowledge base stats
  const { data: knowledgeStats } = useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('project, created_at, active')
      
      if (error) throw error
      return data || []
    }
  })

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('area, rol_empresa, last_login, created_at')
      
      if (error) throw error
      return data || []
    }
  })

  // Calculate metrics
  const totalQueries = analytics?.length || 0
  const activeUsers = userStats?.filter(u => u.last_login)?.length || 0
  const totalUsers = userStats?.length || 0
  const activeKnowledge = knowledgeStats?.filter(k => k.active)?.length || 0
  const totalKnowledge = knowledgeStats?.length || 0

  // Calculate average response time
  const avgResponseTime = analytics?.length > 0 
    ? Math.round(analytics.reduce((sum, item) => sum + (item.response_time || 0), 0) / analytics.length)
    : 0

  // Group analytics by area
  const querysByArea = userStats?.reduce((acc: Record<string, number>, user) => {
    const area = user.area || 'Sin área'
    acc[area] = (acc[area] || 0) + 1
    return acc
  }, {}) || {}

  // Group knowledge by project
  const knowledgeByProject = knowledgeStats?.reduce((acc: Record<string, number>, item) => {
    const project = item.project || 'General'
    acc[project] = (acc[project] || 0) + 1
    return acc
  }, {}) || {}

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics
            </h1>
            <p className="text-gray-600">Métricas de uso y rendimiento de Cerebro</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Datos en tiempo real
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{totalQueries}</p>
                  <p className="text-sm text-gray-600">Consultas Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{activeUsers}/{totalUsers}</p>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Database className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{activeKnowledge}/{totalKnowledge}</p>
                  <p className="text-sm text-gray-600">Contenido Activo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{avgResponseTime}ms</p>
                  <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Usage by Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usuarios por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(querysByArea).map(([area, count]) => (
                  <div key={area} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{area}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base by Project */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contenido por Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(knowledgeByProject).map(([project, count]) => (
                  <div key={project} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / totalKnowledge) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && analytics.length > 0 ? (
              <div className="space-y-3">
                {analytics.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.query}</p>
                      <p className="text-xs text-gray-500">
                        {item.created_at ? formatDate(item.created_at) : 'Fecha desconocida'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.response_time && (
                        <Badge variant="outline" className="text-xs">
                          {item.response_time}ms
                        </Badge>
                      )}
                      {item.rating && (
                        <Badge 
                          variant={item.rating === 1 ? "default" : "destructive"} 
                          className="text-xs"
                        >
                          {item.rating === 1 ? '👍' : '👎'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay actividad reciente
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics
