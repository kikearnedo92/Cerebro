
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TrendingDown, Users, RefreshCw, Calendar } from 'lucide-react'

interface CohortData {
  cohort_month: string
  users_count: number
  retention_rates: {
    month_1: number
    month_3: number
    month_6: number
    month_12: number
  }
}

interface ChurnRisk {
  user_id: string
  risk_level: 'high' | 'medium' | 'low'
  days_since_last_remittance: number
  total_remittances: number
  predicted_churn_date: string
  intervention_recommended: string
  user_value: number
}

interface RetentionAnalyticsProps {
  data: {
    overallRetention: {
      month_1: number
      month_3: number
      month_6: number
      month_12: number
    }
    cohortAnalysis: CohortData[]
    churnRisks: ChurnRisk[]
    inactiveUsers: {
      total: number
      over_3_months: number
      over_6_months: number
      over_12_months: number
    }
    retentionInsights: Array<{
      insight: string
      impact: 'high' | 'medium' | 'low'
      recommendation: string
    }>
  }
}

export const RetentionAnalytics: React.FC<RetentionAnalyticsProps> = ({ data }) => {
  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const highRiskUsers = data.churnRisks.filter(user => user.risk_level === 'high')
  const totalValueAtRisk = highRiskUsers.reduce((sum, user) => sum + user.user_value, 0)

  return (
    <div className="space-y-6">
      {/* Métricas de Retención */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retención 1 Mes</p>
                <p className="text-2xl font-bold">{data.overallRetention.month_1}%</p>
                <p className="text-sm text-green-600">De usuarios nuevos</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retención 3 Meses</p>
                <p className="text-2xl font-bold">{data.overallRetention.month_3}%</p>
                <p className="text-sm text-blue-600">Usuarios activos</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Inactivos</p>
                <p className="text-2xl font-bold">{data.inactiveUsers.over_3_months.toLocaleString()}</p>
                <p className="text-sm text-red-600">+3 meses sin remesas</p>
              </div>
              <Users className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Riesgo Alto</p>
                <p className="text-2xl font-bold">{highRiskUsers.length}</p>
                <p className="text-sm text-orange-600">Usuarios en riesgo</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Cohortes */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Cohortes - Retención por Mes de Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cohorte</th>
                  <th className="text-center p-3">Usuarios</th>
                  <th className="text-center p-3">1 Mes</th>
                  <th className="text-center p-3">3 Meses</th>
                  <th className="text-center p-3">6 Meses</th>
                  <th className="text-center p-3">12 Meses</th>
                </tr>
              </thead>
              <tbody>
                {data.cohortAnalysis.map((cohort, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{cohort.cohort_month}</td>
                    <td className="p-3 text-center">{cohort.users_count.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <Badge variant={cohort.retention_rates.month_1 > 70 ? 'default' : 'secondary'}>
                        {cohort.retention_rates.month_1}%
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={cohort.retention_rates.month_3 > 50 ? 'default' : 'secondary'}>
                        {cohort.retention_rates.month_3}%
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={cohort.retention_rates.month_6 > 30 ? 'default' : 'secondary'}>
                        {cohort.retention_rates.month_6}%
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={cohort.retention_rates.month_12 > 20 ? 'default' : 'secondary'}>
                        {cohort.retention_rates.month_12}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios en Riesgo de Churn */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios en Riesgo de Churn</CardTitle>
            <Badge variant="destructive">
              ${totalValueAtRisk.toLocaleString()} en riesgo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.churnRisks.slice(0, 10).map((user, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Usuario #{user.user_id.slice(-6)}</span>
                    <Badge variant={getRiskBadgeVariant(user.risk_level)}>
                      {user.risk_level} risk
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${user.user_value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Valor del usuario</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Días sin remesa:</p>
                    <p className="font-medium">{user.days_since_last_remittance} días</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total remesas:</p>
                    <p className="font-medium">{user.total_remittances}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Churn predicho:</p>
                    <p className="font-medium">{user.predicted_churn_date}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{user.intervention_recommended}</p>
                  <Button size="sm" variant="outline">
                    Crear Intervención
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights de Retención */}
      <Card>
        <CardHeader>
          <CardTitle>Insights de Retención</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.retentionInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{insight.insight}</h4>
                  <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                    {insight.impact} impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{insight.recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análisis de Usuarios Inactivos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Usuarios Inactivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.inactiveUsers.over_3_months.toLocaleString()}</p>
              <p className="text-sm text-gray-600">3+ meses inactivos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">{data.inactiveUsers.over_6_months.toLocaleString()}</p>
              <p className="text-sm text-gray-600">6+ meses inactivos</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{data.inactiveUsers.over_12_months.toLocaleString()}</p>
              <p className="text-sm text-gray-600">12+ meses inactivos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
