
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react'
import { AmplitudeInsight } from '@/hooks/useAmplitudeAnalytics'

interface UsabilityInsightsProps {
  insights: AmplitudeInsight[]
}

export const UsabilityInsights: React.FC<UsabilityInsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'friction':
        return AlertTriangle
      case 'user_growth':
        return TrendingUp
      case 'churn_prediction':
        return Users
      case 'onboarding_optimization':
        return Clock
      default:
        return TrendingUp
    }
  }

  const getInsightColor = (impact: number) => {
    if (impact >= 80) return 'destructive'
    if (impact >= 60) return 'default'
    return 'secondary'
  }

  const getPriorityColor = (impact: number) => {
    if (impact >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (impact >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-blue-600 bg-blue-50 border-blue-200'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insights de Usabilidad Críticos</h3>
        <Badge variant="outline" className="text-xs">
          {insights.length} insights detectados
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.insight_type)
          
          return (
            <Card key={index} className={`border-l-4 ${getPriorityColor(insight.impact_score)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    <CardTitle className="text-sm font-medium">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <Badge variant={getInsightColor(insight.impact_score)} className="text-xs">
                    Impacto: {insight.impact_score}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">
                  {insight.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{insight.affected_users.toLocaleString()} usuarios afectados</span>
                    <span>•</span>
                    <span>Etapa: {insight.stage}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Acciones recomendadas:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {insight.recommended_actions.slice(0, 2).map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
