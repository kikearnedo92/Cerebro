
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Users, Zap } from 'lucide-react'

interface UserSegment {
  segment: 'power_users' | 'core_users' | 'casual_users' | 'dormant_users'
  name: string
  count: number
  percentage: number
  avg_remittances: number
  avg_days_to_second: number
  description: string
  color: string
}

interface ActivationAnalyticsProps {
  data: {
    activationRate: number
    totalUsers: number
    activatedUsers: number
    avgTimeToActivation: number
    segments: UserSegment[]
    monthlyTrend: Array<{
      month: string
      activation_rate: number
      new_users: number
      activated_users: number
    }>
  }
}

export const ActivationAnalytics: React.FC<ActivationAnalyticsProps> = ({ data }) => {
  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'power_users': return <Zap className="w-5 h-5 text-yellow-500" />
      case 'core_users': return <Target className="w-5 h-5 text-green-500" />
      case 'casual_users': return <Users className="w-5 h-5 text-blue-500" />
      case 'dormant_users': return <Users className="w-5 h-5 text-gray-400" />
      default: return <Users className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activation Rate</p>
                <p className="text-2xl font-bold">{data.activationRate}%</p>
                <p className="text-sm text-green-600">≥2 remesas en 14 días</p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Activados</p>
                <p className="text-2xl font-bold">{data.activatedUsers.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Del total de usuarios</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">{data.avgTimeToActivation}</p>
                <p className="text-sm text-gray-600">días a activación</p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Analizados</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segmentación de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentación de Usuarios por Activación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.segments.map((segment, index) => (
              <div key={index} className="border rounded-lg p-4" style={{ borderLeftColor: segment.color, borderLeftWidth: '4px' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSegmentIcon(segment.segment)}
                    <h3 className="font-semibold">{segment.name}</h3>
                  </div>
                  <Badge variant="secondary">{segment.percentage}%</Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Usuarios:</span>
                    <span className="font-medium">{segment.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Remesas promedio:</span>
                    <span className="font-medium">{segment.avg_remittances}</span>
                  </div>
                  {segment.avg_days_to_second > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Días a 2da remesa:</span>
                      <span className="font-medium">{segment.avg_days_to_second}</span>
                    </div>
                  )}
                </div>
                
                <Progress 
                  value={segment.percentage} 
                  className="mt-3"
                  style={{ 
                    // @ts-ignore
                    '--progress-background': segment.color 
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendencia Mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Activación Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{month.month}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{month.new_users.toLocaleString()} nuevos usuarios</span>
                    <span>{month.activated_users.toLocaleString()} activados</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{month.activation_rate}%</p>
                  <p className="text-sm text-gray-600">Activation Rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
