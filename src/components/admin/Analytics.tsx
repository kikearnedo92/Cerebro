
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, MessageSquare, Users, FileText, Clock } from 'lucide-react'

const Analytics = () => {
  // Mock analytics data - replace with actual data from Supabase
  const stats = {
    totalQueries: 1247,
    activeUsers: 68,
    avgResponseTime: 2.3,
    knowledgeBaseItems: 156,
    popularQueries: [
      { query: "Políticas de remesas a Colombia", count: 45 },
      { query: "Scripts de atención al cliente", count: 38 },
      { query: "Procedimientos ATC", count: 32 },
      { query: "Regulaciones Chile", count: 28 },
      { query: "Compliance Brasil", count: 24 }
    ],
    userActivity: [
      { area: "Customer Success", queries: 425 },
      { area: "Operaciones", queries: 312 },
      { area: "Producto", queries: 198 },
      { area: "Compliance", queries: 156 },
      { area: "Administración", queries: 89 }
    ],
    contentPerformance: [
      { title: "Manual ATC v2.1", views: 89, rating: 4.8 },
      { title: "Regulaciones Colombia 2024", views: 76, rating: 4.6 },
      { title: "Scripts Comunes", views: 65, rating: 4.7 },
      { title: "Procedimientos Operativos", views: 54, rating: 4.5 }
    ]
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics y Métricas
          </h1>
          <p className="text-gray-600">Monitoreo de uso y rendimiento de Cerebro</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalQueries.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Consultas Totales</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12% vs mes anterior</span>
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
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8% vs mes anterior</span>
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
                <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
                <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">-0.5s vs mes anterior</span>
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
                <p className="text-2xl font-bold">{stats.knowledgeBaseItems}</p>
                <p className="text-sm text-gray-600">Documentos KB</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15 este mes</span>
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
              {stats.popularQueries.map((item, index) => (
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
              {stats.userActivity.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.area}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(item.queries / stats.totalQueries) * 100}%` }}
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

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Contenido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.contentPerformance.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">{item.views} visualizaciones</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Rating: {item.rating}/5</span>
                      <div className="flex ml-2">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-xs ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
