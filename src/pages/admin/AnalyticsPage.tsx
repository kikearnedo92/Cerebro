
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, MessageSquare, Users, FileText, Clock, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d')

  // Mock analytics data
  const stats = {
    totalQueries: 1247,
    activeUsers: 68,
    avgResponseTime: 2.3,
    knowledgeBaseItems: 156,
    satisfaction: 4.2,
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
    usageData: [
      { date: '2024-01-08', queries: 45 },
      { date: '2024-01-09', queries: 52 },
      { date: '2024-01-10', queries: 48 },
      { date: '2024-01-11', queries: 61 },
      { date: '2024-01-12', queries: 55 },
      { date: '2024-01-13', queries: 73 },
      { date: '2024-01-14', queries: 67 }
    ],
    topTopics: [
      { topic: 'Remesas Colombia', count: 89 },
      { topic: 'Atención al cliente', count: 76 },
      { topic: 'Compliance', count: 54 },
      { topic: 'Políticas España', count: 43 },
      { topic: 'Scripts respuesta', count: 38 }
    ]
  }

  const pieColors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics y Métricas
          </h1>
          <p className="text-gray-600">Monitoreo de uso y rendimiento de Cerebro</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último día</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Tendencia de Uso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                  formatter={(value) => [value, 'Consultas']}
                />
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Actividad por Área</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Consultas']} />
                <Bar dataKey="queries" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
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

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Temas Más Consultados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.topTopics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="topic"
                  label={({ topic, percent }) => `${topic} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.topTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tiempo de Respuesta</span>
                <span className="text-sm text-gray-600">1.2s promedio</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Precisión de Respuestas</span>
                <span className="text-sm text-gray-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Satisfacción</span>
                <span className="text-sm text-gray-600">4.2/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Uso KB</span>
                <span className="text-sm text-gray-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsPage
