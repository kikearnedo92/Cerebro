
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Code, CheckCircle, TrendingUp, Zap, Clock } from 'lucide-react'
import { AutoDevDashboardData } from '@/types/autodev'

interface AutoDevMetricsProps {
  data: AutoDevDashboardData
}

export const AutoDevMetrics: React.FC<AutoDevMetricsProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Generaciones Totales',
      value: data.totalGenerations.toString(),
      description: 'Total de códigos generados',
      icon: Code,
      color: 'text-blue-600'
    },
    {
      title: 'Deployments Exitosos',
      value: data.successfulDeployments.toString(),
      description: 'Implementaciones en producción',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Impacto Promedio',
      value: `${data.avgImpactScore.toFixed(1)}%`,
      description: 'Mejora promedio estimada',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Automatizaciones Activas',
      value: data.activeAutomations.toString(),
      description: 'Pipelines ejecutándose',
      icon: Zap,
      color: 'text-yellow-600'
    },
    {
      title: 'Tareas en Cola',
      value: data.queuedTasks.toString(),
      description: 'Esperando procesamiento',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <CardDescription className="mt-1">
              {metric.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
