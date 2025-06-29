
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, TrendingUp, Users, Target } from 'lucide-react'
import { useAmplitudeAnalytics } from '@/hooks/useAmplitudeAnalytics'
import { OnboardingAnalytics } from './OnboardingAnalytics'
import { ActivationAnalytics } from './ActivationAnalytics'
import { RetentionAnalytics } from './RetentionAnalytics'
import { TimeFilterControls } from './TimeFilterControls'

export const RetornaInsightsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  })

  const { 
    data, 
    loading, 
    error, 
    refetch, 
    syncAmplitudeEvents 
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
          <p className="text-red-600 mb-4">Error al cargar datos de Amplitude</p>
          <Button onClick={refetch} variant="outline">Reintentar</Button>
        </div>
      </div>
    )
  }

  // Mock data for demonstration - in production this would come from Amplitude
  const onboardingData = {
    stages: [
      {
        stage: "Registro Inicial",
        completion_rate: 92,
        avg_time_minutes: 3.2,
        friction_points: ["Verificación SMS lenta", "Formulario muy largo"],
        drop_off_count: 4400,
        users_entered: 55000
      },
      {
        stage: "Verificación de Identidad",
        completion_rate: 78,
        avg_time_minutes: 8.5,
        friction_points: ["Calidad de foto ID", "Proceso confuso", "Demora en validación"],
        drop_off_count: 11110,
        users_entered: 50600
      },
      {
        stage: "Información Financiera",
        completion_rate: 85,
        avg_time_minutes: 5.1,
        friction_points: ["Muchas preguntas", "Términos complejos"],
        drop_off_count: 5934,
        users_entered: 39490
      },
      {
        stage: "Primera Transacción",
        completion_rate: 65,
        avg_time_minutes: 12.3,
        friction_points: ["Tarifas no claras", "Proceso largo", "Falta de confianza"],
        drop_off_count: 11744,
        users_entered: 33556
      }
    ],
    totalNewUsers: 55000,
    completionRate: 42,
    avgCompletionTime: 29.1
  }

  const activationData = {
    activationRate: 23.8,
    totalUsers: 55000,
    activatedUsers: 13090,
    avgTimeToActivation: 8.5,
    segments: [
      {
        segment: 'power_users' as const,
        name: 'Power Users',
        count: 8745,
        percentage: 15.9,
        avg_remittances: 4.2,
        avg_days_to_second: 5.8,
        description: 'Más de 2 remesas en sus primeros 14 días',
        color: '#f59e0b'
      },
      {
        segment: 'core_users' as const,
        name: 'Core Users',
        count: 4345,
        percentage: 7.9,
        avg_remittances: 2.0,
        avg_days_to_second: 11.2,
        description: 'Exactamente 2 remesas en sus primeros 14 días',
        color: '#10b981'
      },
      {
        segment: 'casual_users' as const,
        name: 'Casual Users',
        count: 16500,
        percentage: 30.0,
        avg_remittances: 1.0,
        avg_days_to_second: 0,
        description: 'Solo 1 remesa en sus primeros 14 días',
        color: '#3b82f6'
      },
      {
        segment: 'dormant_users' as const,
        name: 'Dormant Users',
        count: 25410,
        percentage: 46.2,
        avg_remittances: 0.0,
        avg_days_to_second: 0,
        description: 'Sin remesas en sus primeros 14 días',
        color: '#6b7280'
      }
    ],
    monthlyTrend: [
      { month: 'Enero 2024', activation_rate: 21.5, new_users: 4200, activated_users: 903 },
      { month: 'Febrero 2024', activation_rate: 22.8, new_users: 4800, activated_users: 1094 },
      { month: 'Marzo 2024', activation_rate: 24.1, new_users: 5100, activated_users: 1229 },
      { month: 'Abril 2024', activation_rate: 23.3, new_users: 4900, activated_users: 1142 },
      { month: 'Mayo 2024', activation_rate: 25.2, new_users: 5300, activated_users: 1336 },
      { month: 'Junio 2024', activation_rate: 23.8, new_users: 4700, activated_users: 1119 }
    ]
  }

  const retentionData = {
    overallRetention: {
      month_1: 78,
      month_3: 52,
      month_6: 34,
      month_12: 23
    },
    cohortAnalysis: [
      { cohort_month: 'Enero 2024', users_count: 4200, retention_rates: { month_1: 82, month_3: 58, month_6: 41, month_12: 0 } },
      { cohort_month: 'Febrero 2024', users_count: 4800, retention_rates: { month_1: 79, month_3: 54, month_6: 38, month_12: 0 } },
      { cohort_month: 'Marzo 2024', users_count: 5100, retention_rates: { month_1: 81, month_3: 56, month_6: 0, month_12: 0 } },
      { cohort_month: 'Abril 2024', users_count: 4900, retention_rates: { month_1: 76, month_3: 49, month_6: 0, month_12: 0 } },
      { cohort_month: 'Mayo 2024', users_count: 5300, retention_rates: { month_1: 75, month_3: 0, month_6: 0, month_12: 0 } },
      { cohort_month: 'Junio 2024', users_count: 4700, retention_rates: { month_1: 78, month_3: 0, month_6: 0, month_12: 0 } }
    ],
    churnRisks: [
      { user_id: 'u_4f8d9a2b1c', risk_level: 'high' as const, days_since_last_remittance: 45, total_remittances: 12, predicted_churn_date: '2024-07-15', intervention_recommended: 'Oferta de descuento + recordatorio personalizado', user_value: 2400 },
      { user_id: 'u_7e3a5b8f2d', risk_level: 'high' as const, days_since_last_remittance: 52, total_remittances: 8, predicted_churn_date: '2024-07-20', intervention_recommended: 'Contacto telefónico + incentivo familiar', user_value: 1800 },
      { user_id: 'u_9c2d6e1a4b', risk_level: 'high' as const, days_since_last_remittance: 38, total_remittances: 15, predicted_churn_date: '2024-07-12', intervention_recommended: 'Email de reconquista + beneficio exclusivo', user_value: 3200 }
    ],
    inactiveUsers: {
      total: 18500,
      over_3_months: 12400,
      over_6_months: 8900,
      over_12_months: 4200
    },
    retentionInsights: [
      { insight: 'Los usuarios que completan KYC en menos de 24h tienen 40% más retención', impact: 'high' as const, recommendation: 'Priorizar validación KYC y enviar recordatorios urgentes' },
      { insight: 'Usuarios que reciben su primera remesa en fin de semana tienen menor retención', impact: 'medium' as const, recommendation: 'Optimizar horarios de entrega y comunicación' },
      { insight: 'El abandono más alto ocurre entre los días 15-30 después del registro', impact: 'high' as const, recommendation: 'Implementar campaña de re-engagement en día 14' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Insights de Retorna B2C</h1>
            <p className="text-gray-600">Analytics de usuarios de la app de remesas - 55,000 usuarios activos</p>
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

      {/* Time Filter Controls */}
      <TimeFilterControls
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customDateRange={customDateRange}
        onCustomDateChange={setCustomDateRange}
      />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="activation" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Activación
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Retención
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding">
          <OnboardingAnalytics data={onboardingData} />
        </TabsContent>

        <TabsContent value="activation">
          <ActivationAnalytics data={activationData} />
        </TabsContent>

        <TabsContent value="retention">
          <RetentionAnalytics data={retentionData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
