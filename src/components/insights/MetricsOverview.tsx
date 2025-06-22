
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, MessageSquare, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { InsightsDashboardData } from '@/types/insights'

interface MetricsOverviewProps {
  data: InsightsDashboardData
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Usuarios Totales',
      value: data.totalUsers.toLocaleString(),
      description: 'Total de usuarios registrados',
      icon: Users,
      trend: '+12.4%',
      trendUp: true
    },
    {
      title: 'Usuarios Activos',
      value: data.activeUsers.toLocaleString(),
      description: 'Usuarios activos últimos 30 días',
      icon: Activity,
      trend: '+8.2%',
      trendUp: true
    },
    {
      title: 'Tickets de Soporte',
      value: data.supportTickets.toString(),
      description: 'Tickets abiertos esta semana',
      icon: MessageSquare,
      trend: '-15.3%',
      trendUp: false
    },
    {
      title: 'Tiempo de Resolución',
      value: `${data.avgResolutionTime}h`,
      description: 'Promedio de resolución',
      icon: Clock,
      trend: '-22.1%',
      trendUp: false
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metric.trendUp ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={metric.trendUp ? 'text-green-600' : 'text-red-600'}>
                {metric.trend}
              </span>
              <span className="ml-1">vs mes anterior</span>
            </div>
            <CardDescription className="mt-1">
              {metric.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
