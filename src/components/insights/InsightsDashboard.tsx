
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, MessageSquare, Clock, Brain, AlertTriangle } from 'lucide-react'

export const InsightsDashboard = () => {
  const metrics = [
    {
      title: "Consultas Totales",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: MessageSquare
    },
    {
      title: "Usuarios Activos",
      value: "124",
      change: "+8%",
      trend: "up", 
      icon: Users
    },
    {
      title: "Tiempo Promedio",
      value: "2.3s",
      change: "-15%",
      trend: "down",
      icon: Clock
    },
    {
      title: "Satisfacción",
      value: "94%",
      change: "+3%",
      trend: "up",
      icon: TrendingUp
    }
  ]

  const topQueries = [
    { query: "¿Cómo funciona el sistema de pagos?", count: 89 },
    { query: "Procedimiento de onboarding", count: 67 },
    { query: "Políticas de reembolso", count: 45 },
    { query: "Integración con APIs", count: 38 },
    { query: "Configuración de equipos", count: 29 }
  ]

  const insights = [
    {
      type: "friction",
      title: "Fricción detectada en onboarding",
      description: "65% de usuarios abandonan en el paso 3 del registro",
      severity: "high",
      department: "Producto"
    },
    {
      type: "opportunity",
      title: "Oportunidad de automatización", 
      description: "78% de consultas CS son sobre el mismo tema",
      severity: "medium",
      department: "CS"
    },
    {
      type: "performance",
      title: "Mejora en tiempo de respuesta",
      description: "AI responde 40% más rápido desde última actualización",
      severity: "low",
      department: "Tech"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
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
                <metric.icon className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas más frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topQueries.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm truncate flex-1 mr-2">{item.query}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Insights de AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <div className="flex gap-1">
                      <Badge 
                        variant={insight.severity === 'high' ? 'destructive' : insight.severity === 'medium' ? 'default' : 'secondary'}
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

      {/* Department Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones por departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-purple-700 mb-2">Producto</h3>
              <ul className="text-sm space-y-1">
                <li>• Simplificar proceso de onboarding</li>
                <li>• Agregar tooltips explicativos</li>
                <li>• Mejorar UX del formulario de registro</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-blue-700 mb-2">Customer Success</h3>
              <ul className="text-sm space-y-1">
                <li>• Crear FAQ automatizado</li>
                <li>• Templates de respuesta</li>
                <li>• Chatbot para consultas comunes</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-green-700 mb-2">Marketing</h3>
              <ul className="text-sm space-y-1">
                <li>• Contenido educativo sobre pagos</li>
                <li>• Videos de onboarding</li>
                <li>• Campaigns de retención</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
