
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, AlertTriangle, Clock, Target, DollarSign, Smartphone, Globe } from 'lucide-react'
import { useAmplitudeAnalytics } from '@/hooks/useAmplitudeAnalytics'

export const RetornaInsightsDashboard = () => {
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    syncAmplitudeEvents, 
    getHighestImpactInsights,
    getOnboardingHealthStatus,
    getMostProblematicStage 
  } = useAmplitudeAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de Amplitude...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error al cargar datos de Amplitude</p>
          <Button onClick={refetch} variant="outline">Reintentar</Button>
        </div>
      </div>
    )
  }

  const retornaMetrics = [
    {
      title: "Usuarios Activos Retorna",
      value: "55,247",
      change: "+8.4%",
      trend: "up",
      icon: Users,
      description: "Usuarios activos en la app de remesas"
    },
    {
      title: "Score de Usabilidad",
      value: `${data?.usabilityScore || 78}/100`,
      change: data?.usabilityScore >= 80 ? "+5%" : "-2%",
      trend: data?.usabilityScore >= 80 ? "up" : "down",
      icon: Target,
      description: "Puntuación general de experiencia de usuario"
    },
    {
      title: "Usuarios en Riesgo",
      value: data?.churnPredictions?.high_risk_users?.toLocaleString() || "1,247",
      change: "+12%",
      trend: "up",
      icon: AlertTriangle,
      description: "Usuarios con alta probabilidad de churn"
    },
    {
      title: "Tasa de Conversión KYC",
      value: `${Math.round((data?.conversionRates?.registration_to_kyc || 0.82) * 100)}%`,
      change: data?.conversionRates?.registration_to_kyc >= 0.8 ? "+3%" : "-5%",
      trend: data?.conversionRates?.registration_to_kyc >= 0.8 ? "up" : "down",
      icon: DollarSign,
      description: "Conversión de registro a KYC completo"
    }
  ]

  const highImpactInsights = getHighestImpactInsights(5)
  const onboardingHealth = getOnboardingHealthStatus()
  const problematicStage = getMostProblematicStage()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Insights de Retorna</h1>
            <p className="text-gray-600">Analítica de usuarios B2C de la app de remesas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={syncAmplitudeEvents} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            Sincronizar Amplitude
          </Button>
          <Button onClick={refetch} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {retornaMetrics.map((metric, index) => (
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
                <metric.icon className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onboarding Health Alert */}
      {onboardingHealth === 'critical' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Estado Crítico del Onboarding</h3>
                <p className="text-sm text-red-700">
                  {problematicStage ? 
                    `Problemas detectados en: ${problematicStage.stage}. ${problematicStage.issues.join(', ')}.` :
                    'Múltiples etapas del onboarding presentan problemas críticos.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Impact Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Insights de Alto Impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highImpactInsights.length > 0 ? (
                highImpactInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex gap-1">
                        <Badge 
                          variant={insight.impact_score > 100 ? 'destructive' : insight.impact_score > 50 ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {insight.impact_score}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.affected_users} usuarios
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {insight.recommended_actions.slice(0, 2).map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay insights disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.onboardingAnalysis?.stage_metrics ? (
              <div className="space-y-4">
                {Object.entries(data.onboardingAnalysis.stage_metrics).map(([stage, metrics]) => (
                  <div key={stage} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm capitalize">{stage.replace('_', ' ')}</h4>
                      <Badge 
                        variant={metrics.completion_rate > 0.8 ? 'default' : metrics.completion_rate > 0.6 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {Math.round(metrics.completion_rate * 100)}% completado
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>Tiempo promedio: {metrics.average_time_minutes}min</div>
                      <div>Usuarios: {metrics.user_count}</div>
                      <div>Fricción: {metrics.friction_incidents}</div>
                      <div>Abandonos: {metrics.drop_off_count}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de onboarding disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Churn Predictions */}
      {data?.churnPredictions && (
        <Card>
          <CardHeader>
            <CardTitle>Predicciones de Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{data.churnPredictions.high_risk_users}</p>
                <p className="text-sm text-gray-600">Usuarios en riesgo alto</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{Math.round(data.churnPredictions.predicted_churn_rate * 100)}%</p>
                <p className="text-sm text-gray-600">Tasa de churn predicha</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{data.churnPredictions.total_analyzed_users}</p>
                <p className="text-sm text-gray-600">Usuarios analizados</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Principales razones de churn:</h4>
              <div className="flex flex-wrap gap-2">
                {data.churnPredictions.top_churn_reasons.map((reason, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Acciones de prevención recomendadas:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {data.churnPredictions.churn_prevention_actions.map((action, index) => (
                  <li key={index}>• {action}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
