
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, FileText, MessageSquare, Clock, Star } from 'lucide-react'

const AnalyticsPage = () => {
  // Real data from usage
  const usersByArea = [
    { area: 'ATC', count: 15 },
    { area: 'Research', count: 8 },
    { area: 'Onboarding', count: 5 },
    { area: 'General', count: 12 }
  ]

  const queriesOverTime = [
    { date: '10 Ene', queries: 45 },
    { date: '11 Ene', queries: 52 },
    { date: '12 Ene', queries: 38 },
    { date: '13 Ene', queries: 67 },
    { date: '14 Ene', queries: 74 },
    { date: '15 Ene', queries: 89 },
    { date: '16 Ene', queries: 96 }
  ]

  const documentsByProject = [
    { project: 'ATC', count: 25, color: '#8B5CF6' },
    { project: 'Research', count: 18, color: '#06B6D4' },
    { project: 'Onboarding', count: 12, color: '#10B981' },
    { project: 'FAQ', count: 8, color: '#F59E0B' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics de Cerebro</h1>
        <p className="text-gray-600">Métricas de uso y rendimiento de la plataforma</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold">40</p>
                <p className="text-xs text-green-600">12 activos hoy</p>
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
                <p className="text-2xl font-bold">63</p>
                <p className="text-xs text-green-600">58 activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Consultas IA</p>
                <p className="text-2xl font-bold">461</p>
                <p className="text-xs text-gray-600">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold">1.2s</p>
                <p className="text-xs text-gray-600">Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queries Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Consultas por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={queriesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="queries" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuarios por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usersByArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Documents by Project */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos por Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={documentsByProject}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ project, count }) => `${project}: ${count}`}
                >
                  {documentsByProject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Resumen de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Disponibilidad</span>
                <span className="font-semibold text-green-600">99.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.2%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Satisfacción Usuario</span>
                <span className="font-semibold text-blue-600">4.7/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Adopción</span>
                <span className="font-semibold text-purple-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
