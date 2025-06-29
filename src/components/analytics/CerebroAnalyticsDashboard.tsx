
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, MessageSquare, Clock, Brain, FileText } from 'lucide-react'

export const CerebroAnalyticsDashboard = () => {
  const cerebroMetrics = [
    {
      title: "Consultas CEREBRO",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      description: "Consultas realizadas al asistente interno"
    },
    {
      title: "Empleados Activos",
      value: "89",
      change: "+8%",
      trend: "up", 
      icon: Users,
      description: "Empleados que usan CEREBRO regularmente"
    },
    {
      title: "Tiempo de Respuesta",
      value: "2.3s",
      change: "-15%",
      trend: "down",
      icon: Clock,
      description: "Tiempo promedio de respuesta del AI"
    },
    {
      title: "Documentos Consultados",
      value: "18",
      change: "+2",
      trend: "up",
      icon: FileText,
      description: "Documentos activos en base de conocimiento"
    }
  ]

  const topCerebroQueries = [
    { query: "¿Cómo funciona el proceso de onboarding?", count: 89, department: "RRHH" },
    { query: "Procedimientos de compliance", count: 67, department: "Legal" },
    { query: "Políticas de reembolso", count: 45, department: "CS" },
    { query: "Configuración de sistemas", count: 38, department: "Tech" },
    { query: "Reportes financieros", count: 29, department: "Finanzas" }
  ]

  const cerebroInsights = [
    {
      type: "efficiency",
      title: "Alta adopción en departamento Tech",
      description: "El 92% del equipo técnico usa CEREBRO diariamente",
      severity: "low",
      department: "Tech",
      impact: "positive"
    },
    {
      type: "opportunity",
      title: "Necesidad de más documentos de RRHH", 
      description: "68% de consultas sobre procedimientos sin respuesta completa",
      severity: "medium",
      department: "RRHH",
      impact: "neutral"
    },
    {
      type: "performance",
      title: "Mejora en tiempo de respuesta",
      description: "Optimización del AI redujo latencia en 40%",
      severity: "low",
      department: "Tech",
      impact: "positive"
    }
  ]

  const departmentUsage = [
    { department: "Tech", users: 25, queries: 1200, adoption: 92 },
    { department: "Customer Success", users: 18, queries: 890, adoption: 85 },
    { department: "Legal", users: 8, queries: 340, adoption: 78 },
    { department: "RRHH", users: 12, queries: 280, adoption: 65 },
    { department: "Finanzas", users: 15, queries: 137, adoption: 48 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">Analytics de CEREBRO</h1>
          <p className="text-gray-600">Analítica de uso interno del asistente de conocimiento</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cerebroMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </p>
                </div>
                <metric.icon className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top CEREBRO Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas más frecuentes en CEREBRO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCerebroQueries.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="text-sm truncate block">{item.query}</span>
                    <Badge variant="outline" className="text-xs mt-1">{item.department}</Badge>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CEREBRO Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Insights de CEREBRO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cerebroInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <div className="flex gap-1">
                      <Badge 
                        variant={insight.impact === 'positive' ? 'default' : insight.impact === 'neutral' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {insight.department}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Adopción por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentUsage.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-gray-600">{dept.adoption}% adopción</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{dept.users} usuarios</span>
                    <span>{dept.queries} consultas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dept.adoption}%` }}
                    ></div>
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
