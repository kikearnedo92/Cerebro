
import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ConversationAnalytic } from '@/types/insights'
import { AlertTriangle, MessageSquare, User, Clock } from 'lucide-react'

interface ConversationInsightsProps {
  data: ConversationAnalytic[]
}

export const ConversationInsights: React.FC<ConversationInsightsProps> = ({ data }) => {
  const analytics = useMemo(() => {
    // Análisis por categoría de problema
    const issueCategories = data.reduce((acc, item) => {
      acc[item.issue_category] = (acc[item.issue_category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Análisis por tipo de usuario
    const userTypes = data.reduce((acc, item) => {
      acc[item.user_type] = (acc[item.user_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Análisis de sentimiento
    const sentimentAnalysis = data.filter(item => item.sentiment_score !== undefined)
      .reduce((acc, item) => {
        const score = item.sentiment_score!
        if (score <= -0.5) acc.negative++
        else if (score >= 0.5) acc.positive++
        else acc.neutral++
        return acc
      }, { positive: 0, neutral: 0, negative: 0 })

    // Top problemas por prioridad
    const criticalIssues = data
      .filter(item => item.priority_level === 'critical' || item.priority_level === 'high')
      .slice(0, 5)

    return {
      issueCategories: Object.entries(issueCategories).map(([name, value]) => ({ name, value })),
      userTypes: Object.entries(userTypes).map(([name, value]) => ({ name, value })),
      sentimentAnalysis,
      criticalIssues,
      totalIssues: data.length,
      avgSentiment: data.filter(item => item.sentiment_score !== undefined)
        .reduce((sum, item) => sum + item.sentiment_score!, 0) / 
        data.filter(item => item.sentiment_score !== undefined).length
    }
  }, [data])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getIssueCategoryLabel = (category: string) => {
    const labels = {
      'transfer_delay': 'Demoras en Transferencias',
      'kyc_issues': 'Problemas KYC',
      'high_fees': 'Fees Altos',
      '  p_crashes': 'Crashes de App',
      'confusing_ui': 'UI Confusa'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getUserTypeLabel = (type: string) => {
    const labels = {
      'new_customer': 'Nuevos Clientes',
      'returning_customer': 'Clientes Recurrentes',
      'high_value_customer': 'Clientes VIP'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Conversaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Problemas reportados últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentimiento Promedio</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgSentiment ? analytics.avgSentiment.toFixed(2) : 'N/A'}
            </div>
            <Progress 
              value={((analytics.avgSentiment + 1) / 2) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              -1.0 (muy negativo) a 1.0 (muy positivo)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.criticalIssues.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problemas por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Problemas por Categoría</CardTitle>
            <CardDescription>
              Distribución de issues reportados por tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.issueCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={getIssueCategoryLabel}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={getIssueCategoryLabel}
                  formatter={(value) => [value, 'Cantidad']}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Tipo de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Issues por Tipo de Usuario</CardTitle>
            <CardDescription>
              Quién reporta más problemas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.userTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    `${getUserTypeLabel(name)} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.userTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Issues']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Issues Críticos Detallados */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Críticos - Acción Requerida</CardTitle>
          <CardDescription>
            Problemas de alta prioridad que requieren atención inmediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.criticalIssues.map((issue, index) => (
              <div key={issue.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(issue.priority_level)}>
                      {issue.priority_level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {getUserTypeLabel(issue.user_type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(issue.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">
                    {getIssueCategoryLabel(issue.issue_category)}
                  </h4>
                  {issue.suggested_improvement && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Mejora sugerida:</strong> {issue.suggested_improvement}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span>Estado: <strong>{issue.resolution_status}</strong></span>
                    {issue.sentiment_score !== undefined && (
                      <span>
                        Sentimiento: 
                        <strong className={
                          issue.sentiment_score < -0.5 ? 'text-red-600' : 
                          issue.sentiment_score > 0.5 ? 'text-green-600' : 'text-yellow-600'
                        }>
                          {issue.sentiment_score.toFixed(2)}
                        </strong>
                      </span>
                    )}
                  </div>
                  {issue.affected_journey_stage && (
                    <Badge variant="secondary">
                      {issue.affected_journey_stage}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
