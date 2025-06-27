
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Target, DollarSign, AlertTriangle, Brain, Settings, Plus, ExternalLink } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const NucleoInsightsDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mixpanelConnected, setMixpanelConnected] = useState(false)
  const [amplitudeConnected, setAmplitudeConnected] = useState(false)
  const [salesforceConnected, setSalesforceConnected] = useState(false)

  const metrics = [
    {
      title: "ARR",
      value: "$127k",
      change: "+23%",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Active Users",
      value: "2,847",
      change: "+12%", 
      trend: "up",
      icon: Users
    },
    {
      title: "Conversion Rate",
      value: "12.4%",
      change: "+3.2%",
      trend: "up",
      icon: Target
    },
    {
      title: "Churn Risk",
      value: "8.7%",
      change: "-2.1%",
      trend: "down",
      icon: AlertTriangle
    }
  ]

  const churnRisks = [
    {
      company: "TechCorp Inc",
      probability: 89,
      reason: "Bajo uso últimos 14 días",
      value: "$12k ARR",
      action: "Contactar CSM"
    },
    {
      company: "StartupXYZ",
      probability: 76,
      reason: "No completó onboarding",
      value: "$8k ARR",
      action: "Enviar tutorial"
    },
    {
      company: "Enterprise Co",
      probability: 65,
      reason: "Support tickets frecuentes",
      value: "$45k ARR",
      action: "Revisión técnica"
    }
  ]

  const frictionPoints = [
    {
      stage: "Onboarding",
      dropoff: "34%",
      impact: "High",
      suggestion: "Simplificar setup inicial"
    },
    {
      stage: "First Value",
      dropoff: "23%",
      impact: "High",
      suggestion: "Guided tour interactivo"
    },
    {
      stage: "Integration",
      dropoff: "18%",
      impact: "Medium",
      suggestion: "Documentación mejorada"
    }
  ]

  const handleConnect = (platform: string) => {
    switch (platform) {
      case 'mixpanel':
        setMixpanelConnected(true)
        break
      case 'amplitude':
        setAmplitudeConnected(true)
        break
      case 'salesforce':
        setSalesforceConnected(true)
        break
    }
    
    toast({
      title: `${platform} conectado`,
      description: "Sincronizando datos..."
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-gray-600">Analytics predictivo para detectar fricción y churn</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'bg-white shadow-sm' : ''}
        >
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'integrations' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('integrations')}
          className={activeTab === 'integrations' ? 'bg-white shadow-sm' : ''}
        >
          <Settings className="w-4 h-4 mr-2" />
          Integraciones
        </Button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
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
            {/* Churn Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Riesgo de Churn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {churnRisks.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{risk.company}</h4>
                        <Badge 
                          variant={risk.probability > 80 ? 'destructive' : risk.probability > 60 ? 'default' : 'secondary'}
                        >
                          {risk.probability}% riesgo
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{risk.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">{risk.value}</span>
                        <Button size="sm" variant="outline">
                          {risk.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Friction Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  Análisis de Fricción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frictionPoints.map((point, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{point.stage}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{point.dropoff} dropoff</Badge>
                          <Badge 
                            variant={point.impact === 'High' ? 'destructive' : 'default'}
                          >
                            {point.impact}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{point.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Recomendaciones AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                  <h3 className="font-medium text-red-700 mb-2">🚨 Acción Urgente</h3>
                  <p className="text-sm text-red-600 mb-3">
                    3 clientes enterprise en riesgo alto de churn (ARR: $65k)
                  </p>
                  <Button size="sm" variant="destructive">
                    Ver plan de retención
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <h3 className="font-medium text-yellow-700 mb-2">⚡ Optimización</h3>
                  <p className="text-sm text-yellow-600 mb-3">
                    Reducir fricción en onboarding podría aumentar conversión 15%
                  </p>
                  <Button size="sm" variant="outline">
                    Ver propuesta
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h3 className="font-medium text-green-700 mb-2">📈 Oportunidad</h3>
                  <p className="text-sm text-green-600 mb-3">
                    Segmento "Startups" muestra alta engagement - expandir targeting
                  </p>
                  <Button size="sm" variant="outline">
                    Ver análisis
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conectar fuentes de datos</CardTitle>
              <p className="text-sm text-gray-600">
                Conecta tus herramientas para obtener insights precisos sobre fricción y churn
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mixpanel */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mixpanel</h3>
                    <p className="text-sm text-gray-600">Analytics de producto y eventos de usuario</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mixpanelConnected ? (
                    <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                  ) : (
                    <Button onClick={() => handleConnect('mixpanel')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>

              {/* Amplitude */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Amplitude</h3>
                    <p className="text-sm text-gray-600">Análisis de comportamiento y retención</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {amplitudeConnected ? (
                    <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                  ) : (
                    <Button onClick={() => handleConnect('amplitude')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>

              {/* Salesforce */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Salesforce</h3>
                    <p className="text-sm text-gray-600">CRM y datos de ventas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {salesforceConnected ? (
                    <Badge className="bg-green-100 text-green-700">Conectado</Badge>
                  ) : (
                    <Button onClick={() => handleConnect('salesforce')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones de configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📖 Cómo configurar Mixpanel
                  </h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Ve a tu dashboard de Mixpanel</li>
                    <li>Navega a Settings → Project Settings</li>
                    <li>Copia tu Project Token</li>
                    <li>Pégalo en el campo de arriba y conecta</li>
                  </ol>
                  <Button variant="outline" size="sm" className="mt-2">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Mixpanel
                  </Button>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">
                    🔗 Qué datos analizaremos
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Eventos de onboarding y abandono</li>
                    <li>• Patrones de uso y engagement</li>
                    <li>• Cohortes de retención</li>
                    <li>• Funnels de conversión</li>
                    <li>• Señales tempranas de churn</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
