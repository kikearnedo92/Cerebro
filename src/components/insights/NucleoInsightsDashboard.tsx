
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ExternalLink,
  Settings,
  Plus
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'
import { toast } from '@/hooks/use-toast'

// Datos simulados pero realistas para demo
const revenueData = [
  { month: 'Ene', revenue: 45000, users: 120 },
  { month: 'Feb', revenue: 52000, users: 145 },
  { month: 'Mar', revenue: 48000, users: 138 },
  { month: 'Abr', revenue: 61000, users: 167 },
  { month: 'May', revenue: 55000, users: 156 },
  { month: 'Jun', revenue: 67000, users: 189 }
]

const churnData = [
  { segment: 'Nuevos usuarios (<30 días)', churn: 15, count: 45 },
  { segment: 'Usuarios regulares (30-90 días)', churn: 8, count: 89 },
  { segment: 'Usuarios establecidos (>90 días)', churn: 3, count: 156 }
]

const frictionPoints = [
  { 
    area: 'Onboarding', 
    friction_score: 75, 
    impact: 'Alto',
    description: 'Usuarios abandonan en el paso 3 de verificación',
    affected_users: 234,
    recommended_action: 'Simplificar proceso KYC'
  },
  {
    area: 'Primer depósito',
    friction_score: 45,
    impact: 'Medio',
    description: 'Demora en activación de cuenta',
    affected_users: 89,
    recommended_action: 'Acelerar validación bancaria'
  }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export const NucleoInsightsDashboard = () => {
  const [integrations, setIntegrations] = useState({
    amplitude: { connected: false, lastSync: null },
    mixpanel: { connected: false, lastSync: null },
    salesforce: { connected: false, lastSync: null },
    stripe: { connected: false, lastSync: null }
  })

  const [apiKeys, setApiKeys] = useState({
    amplitude: '',
    mixpanel: '',
    salesforce: '',
    stripe: ''
  })

  const connectIntegration = (platform: string) => {
    const apiKey = apiKeys[platform as keyof typeof apiKeys]
    
    if (!apiKey) {
      toast({
        title: "API Key requerida",
        description: `Por favor ingresa tu API key de ${platform}`,
        variant: "destructive"
      })
      return
    }

    // Simular conexión
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          connected: true,
          lastSync: new Date().toISOString()
        }
      }))
      
      toast({
        title: "Integración conectada",
        description: `${platform} conectado exitosamente. Sincronizando datos...`
      })
    }, 1500)
  }

  const triggerAIAnalysis = () => {
    toast({
      title: "Análisis AI iniciado",
      description: "Analizando patrones de fricción y prediciendo churn..."
    })
    
    setTimeout(() => {
      toast({
        title: "Análisis completado",
        description: "Se encontraron 3 nuevos insights críticos"
      })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue MRR</p>
                <p className="text-2xl font-bold">$67,000</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs mes anterior
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">189</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +21% crecimiento
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">5.2%</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  +0.8% este mes
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold">82</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Saludable
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="friction">Friction Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predicciones</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue & Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Usuarios"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Churn por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={churnData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="churn" fill="#EF4444" name="Churn %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="friction" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Análisis de Fricción</h3>
            <Button onClick={triggerAIAnalysis} className="bg-gradient-to-r from-blue-600 to-green-600">
              <Zap className="w-4 h-4 mr-2" />
              Ejecutar Análisis AI
            </Button>
          </div>

          <div className="grid gap-4">
            {frictionPoints.map((point, index) => (
              <Card key={index} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{point.area}</h4>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                    <Badge variant={point.impact === 'Alto' ? 'destructive' : 'secondary'}>
                      Impacto {point.impact}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Friction Score</span>
                        <span>{point.friction_score}/100</span>
                      </div>
                      <Progress value={point.friction_score} className="h-2" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Usuarios afectados:</span>
                        <p className="font-medium">{point.affected_users}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Acción recomendada:</span>
                        <p className="font-medium text-blue-600">{point.recommended_action}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Predicciones AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Alto Riesgo de Churn</h4>
                  <p className="text-2xl font-bold text-red-600">23 usuarios</p>
                  <p className="text-sm text-red-600">Próximos 30 días</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Riesgo Medio</h4>
                  <p className="text-2xl font-bold text-yellow-600">45 usuarios</p>
                  <p className="text-sm text-yellow-600">Próximos 60 días</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Potencial Upsell</h4>
                  <p className="text-2xl font-bold text-green-600">67 usuarios</p>
                  <p className="text-sm text-green-600">Listos para upgrade</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">Recomendaciones Específicas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>CS Team:</strong> Contactar a usuarios de alto riesgo con oferta especial</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Product:</strong> Simplificar onboarding, especialmente paso 3</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Growth:</strong> Crear campaña de re-engagement para usuarios inactivos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Ops:</strong> Automatizar proceso de validación bancaria</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {Object.entries(integrations).map(([platform, config]) => (
              <Card key={platform}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        config.connected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <BarChart3 className={`w-5 h-5 ${
                          config.connected ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{platform}</h4>
                        <p className="text-sm text-gray-600">
                          {config.connected 
                            ? `Conectado - Último sync: ${new Date(config.lastSync!).toLocaleString()}`
                            : 'No conectado'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant={config.connected ? "default" : "secondary"}>
                      {config.connected ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  
                  {!config.connected && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`${platform}-key`}>API Key</Label>
                        <Input
                          id={`${platform}-key`}
                          type="password"
                          placeholder={`Ingresa tu API key de ${platform}`}
                          value={apiKeys[platform as keyof typeof apiKeys]}
                          onChange={(e) => setApiKeys(prev => ({
                            ...prev,
                            [platform]: e.target.value
                          }))}
                        />
                      </div>
                      <Button 
                        onClick={() => connectIntegration(platform)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Conectar {platform}
                      </Button>
                    </div>
                  )}
                  
                  {config.connected && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
