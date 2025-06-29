
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Users, Clock, TrendingDown } from 'lucide-react'

interface OnboardingStage {
  stage: string
  completion_rate: number
  avg_time_minutes: number
  friction_points: string[]
  drop_off_count: number
  users_entered: number
}

interface OnboardingAnalyticsProps {
  data: {
    stages: OnboardingStage[]
    totalNewUsers: number
    completionRate: number
    avgCompletionTime: number
  }
}

export const OnboardingAnalytics: React.FC<OnboardingAnalyticsProps> = ({ data }) => {
  const getMostFrictionStage = () => {
    return data.stages.reduce((prev, current) => 
      prev.completion_rate < current.completion_rate ? prev : current
    )
  }

  const frictionStage = getMostFrictionStage()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Nuevos</p>
                <p className="text-2xl font-bold">{data.totalNewUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Sin remesas entregadas</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Completado</p>
                <p className="text-2xl font-bold">{data.completionRate}%</p>
                <p className="text-sm text-green-600">Onboarding completo</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{data.avgCompletionTime}min</p>
                <p className="text-sm text-gray-600">Para completar</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mayor Fricción</p>
                <p className="text-lg font-bold">{frictionStage.stage}</p>
                <p className="text-sm text-red-600">{frictionStage.completion_rate}% completado</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fases del Onboarding */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Fases del Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.stages.map((stage, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{stage.stage}</h3>
                  <div className="flex gap-2">
                    <Badge variant={stage.completion_rate > 80 ? 'default' : stage.completion_rate > 60 ? 'secondary' : 'destructive'}>
                      {stage.completion_rate}% completado
                    </Badge>
                    <Badge variant="outline">
                      {stage.avg_time_minutes}min promedio
                    </Badge>
                  </div>
                </div>
                
                <Progress value={stage.completion_rate} className="mb-3" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Usuarios que Ingresaron</p>
                    <p className="text-xl font-bold text-blue-600">{stage.users_entered.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Usuarios que Abandonaron</p>
                    <p className="text-xl font-bold text-red-600">{stage.drop_off_count.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tasa de Abandono</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.round((stage.drop_off_count / stage.users_entered) * 100)}%
                    </p>
                  </div>
                </div>

                {stage.friction_points.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-red-700">Puntos de Fricción Detectados:</h4>
                    <div className="flex flex-wrap gap-1">
                      {stage.friction_points.map((point, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700">
                          {point}
                        </Badge>
                      ))}
                    </div>
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
