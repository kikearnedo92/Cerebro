
import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ChurnPrediction } from '@/types/insights'
import { AlertTriangle, TrendingDown, Users, Target, Phone, Mail } from 'lucide-react'

interface ChurnAnalysisProps {
  data: ChurnPrediction[]
}

export const ChurnAnalysis: React.FC<ChurnAnalysisProps> = ({ data }) => {
  const analytics = useMemo(() => {
    // Distribución por nivel de riesgo
    const riskDistribution = data.reduce((acc, item) => {
      acc[item.risk_level] = (acc[item.risk_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Usuarios de alto riesgo (próximos a churning)
    const highRiskUsers = data
      .filter(item => item.risk_level === 'high')
      .sort((a, b) => b.churn_probability - a.churn_probability)
      .slice(0, 10)

    // Factores más comunes de churn
    const churnFactors = data.flatMap(item => item.key_factors)
      .reduce((acc, factor) => {
        acc[factor] = (acc[factor] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // Usuarios que necesitan intervención inmediata (churn en próximos 7 días)
    const urgentInterventions = data.filter(item => {
      if (!item.predicted_churn_date) return false
      const churnDate = new Date(item.predicted_churn_date)
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      return churnDate <= sevenDaysFromNow && item.risk_level === 'high'
    })

    return {
      riskDistribution: Object.entries(riskDistribution).map(([name, value]) => ({ name, value })),
      highRiskUsers,
      churnFactors: Object.entries(churnFactors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([name, value]) => ({ name, value })),
      urgentInterventions,
      totalUsers: data.length,
      avgChurnProbability: data.reduce((sum, item) => sum + item.churn_probability, 0) / data.length,
      highRiskCount: data.filter(item => item.risk_level === 'high').length
    }
  }, [data])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getRiskColorClass = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleContactUser = (userId: string, method: 'phone' | 'email') => {
    console.log(`Initiating ${method} contact for user ${userId}`)
    // Aquí se integraría con sistema de CRM/comunicación
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Churn */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Analizados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total en modelo predictivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.highRiskCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios con alta probabilidad de churn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probabilidad Promedio</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.avgChurnProbability * 100).toFixed(1)}%
            </div>
            <Progress value={analytics.avgChurnProbability * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intervención Urgente</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analytics.urgentInterventions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Churn predicho en próximos 7 días
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Riesgo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel de Riesgo</CardTitle>
            <CardDescription>
              Segmentación de usuarios según probabilidad de churn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Factores de Churn */}
        <Card>
          <CardHeader>
            <CardTitle>Principales Factores de Churn</CardTitle>
            <CardDescription>
              Patrones más comunes en usuarios con riesgo de abandono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.churnFactors} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10 }}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuarios de Alto Riesgo */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios de Alto Riesgo - Acción Inmediata</CardTitle>
          <CardDescription>
            Usuarios con mayor probabilidad de churn que requieren intervención proactiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.highRiskUsers.map((user, index) => (
              <div 
                key={user.id} 
                className={`border rounded-lg p-4 space-y-3 ${getRiskColorClass(user.risk_level)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getRiskColor(user.risk_level)}>
                      {user.risk_level.toUpperCase()}
                    </Badge>
                    <span className="font-semibold">
                      Probabilidad: {(user.churn_probability * 100).toFixed(1)}%
                    </span>
                    {user.predicted_churn_date && (
                      <span className="text-sm text-gray-600">
                        Predicho: {new Date(user.predicted_churn_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactUser(user.user_id, 'email')}
                      className="flex items-center"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactUser(user.user_id, 'phone')}
                      className="flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Llamar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Días sin transferir:</span>
                    <div className="font-semibold">{user.days_since_last_transfer || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total transferencias:</span>
                    <div className="font-semibold">{user.total_transfers || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Volumen total:</span>
                    <div className="font-semibold">${user.total_volume_sent?.toLocaleString() || '0'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">KYC:</span>
                    <div className="font-semibold">{user.kyc_completion_status || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Factores de riesgo:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.key_factors.map((factor, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {user.intervention_suggested && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <span className="text-sm font-medium">Intervención sugerida:</span>
                    <p className="text-sm mt-1">{user.intervention_suggested}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
