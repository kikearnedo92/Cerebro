
import React from 'react'
import { Users, Clock, Target, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { AmplitudeDashboardData } from '@/hooks/useAmplitudeAnalytics'

interface UsabilityMetricsProps {
  data: AmplitudeDashboardData | null
}

export const UsabilityMetrics: React.FC<UsabilityMetricsProps> = ({ data }) => {
  const isRealData = data?.status === 'REAL_DATA_FROM_AMPLITUDE'

  const metrics = [
    {
      title: 'Usuarios Activos Totales',
      value: data?.totalActiveUsers || 0,
      description: 'Número total de usuarios únicos que han realizado al menos una acción en los últimos 30 días. Métrica clave para medir el engagement general.',
      icon: Users,
      color: 'blue' as const,
      trend: {
        value: '+12%',
        direction: 'up' as const
      }
    },
    {
      title: 'Usuarios Activos Mensuales',
      value: data?.monthlyActiveUsers || 0,
      description: 'Usuarios únicos que realizaron transacciones en el último mes. Indica la retención y uso regular de la plataforma.',
      icon: Activity,
      color: 'green' as const,
      trend: {
        value: '+8%',
        direction: 'up' as const
      }
    },
    {
      title: 'Nuevos Usuarios',
      value: data?.newUsersLastMonth || 0,
      description: 'Usuarios que se registraron por primera vez en los últimos 30 días. Mide la efectividad de adquisición.',
      icon: Target,
      color: 'purple' as const,
      trend: {
        value: '+15%',
        direction: 'up' as const
      }
    },
    {
      title: 'Score de Usabilidad',
      value: `${data?.usabilityScore || 0}/100`,
      description: 'Índice compuesto que evalúa facilidad de uso, tiempo en tareas críticas y tasa de éxito. Basado en métricas de UX estándar.',
      icon: CheckCircle,
      color: data?.usabilityScore && data.usabilityScore > 75 ? 'green' : 'orange',
      trend: {
        value: '+3pts',
        direction: 'up' as const
      }
    },
    {
      title: 'Conversión Registro → KYC',
      value: `${((data?.conversionRates.registration_to_kyc || 0) * 100).toFixed(1)}%`,
      description: 'Porcentaje de usuarios que completan la verificación KYC después del registro. Crítico para identificar fricciones en onboarding.',
      icon: Target,
      color: 'blue' as const,
      trend: {
        value: '-2%',
        direction: 'down' as const
      }
    },
    {
      title: 'KYC → Primera Transferencia',
      value: `${((data?.conversionRates.kyc_to_first_transfer || 0) * 100).toFixed(1)}%`,
      description: 'Conversión de usuarios verificados a primera transacción. Mide la efectividad del flow post-verificación.',
      icon: Activity,
      color: 'green' as const,
      trend: {
        value: '+5%',
        direction: 'up' as const
      }
    },
    {
      title: 'Tiempo Promedio KYC',
      value: `${data?.averageTimeInStages.kyc_completion || 0} min`,
      description: 'Tiempo promedio para completar verificación de identidad. Tiempos altos indican fricción en el proceso.',
      icon: Clock,
      color: data?.averageTimeInStages.kyc_completion && data.averageTimeInStages.kyc_completion > 10 ? 'red' : 'green',
      trend: {
        value: '-15%',
        direction: 'up' as const
      }
    },
    {
      title: 'Usuarios en Riesgo de Churn',
      value: data?.churnPredictions.high_risk_users || 0,
      description: 'Usuarios con alta probabilidad de abandono basado en patrones de comportamiento. Requieren intervención proactiva.',
      icon: AlertTriangle,
      color: 'red' as const,
      trend: {
        value: '+8%',
        direction: 'down' as const
      }
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          color={metric.color}
          trend={metric.trend}
          isRealData={isRealData}
        />
      ))}
    </div>
  )
}
