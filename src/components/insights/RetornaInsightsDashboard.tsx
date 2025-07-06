
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react'
import { useAmplitudeAnalytics } from '@/hooks/useAmplitudeAnalytics'
import { OnboardingAnalytics } from './OnboardingAnalytics'
import { ActivationAnalytics } from './ActivationAnalytics'
import { RetentionAnalytics } from './RetentionAnalytics'
import { TimeFilterControls } from './TimeFilterControls'
import { DashboardHeader } from './DashboardHeader'
import { DataStatusCard } from './DataStatusCard'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { UsabilityMetrics } from './UsabilityMetrics'
import { UsabilityInsights } from './UsabilityInsights'
import { ErrorConsole } from './ErrorConsole'

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
    errorLogs,
    clearErrorLogs,
    refetch, 
    syncAmplitudeEvents 
  } = useAmplitudeAnalytics()

  const handleRefetch = () => {
    refetch(selectedPeriod)
  }

  const handleSyncAmplitude = async () => {
    await syncAmplitudeEvents()
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRefetch} />
  }

  const isRealData = data?.status === 'REAL_DATA_FROM_AMPLITUDE'
  const dataStatusText = isRealData ? 'Datos REALES de Amplitude' : 'Problema de Conexión'

  // Mock data basado en datos reales de Amplitude
  const onboardingData = {
    stages: [
      {
        stage: "Registro Inicial",
        completion_rate: 92,
        avg_time_minutes: 3.2,
        friction_points: ["Verificación SMS lenta", "Formulario muy largo"],
        drop_off_count: Math.round((data?.totalActiveUsers || 0) * 0.08),
        users_entered: data?.totalActiveUsers || 0
      },
      {
        stage: "Verificación de Identidad",
        completion_rate: Math.round((data?.conversionRates.registration_to_kyc || 0.68) * 100),
        avg_time_minutes: data?.averageTimeInStages.kyc_completion || 8.5,
        friction_points: ["Calidad de foto ID", "Proceso confuso", "Demora en validación"],
        drop_off_count: Math.round((data?.totalActiveUsers || 0) * (1 - (data?.conversionRates.registration_to_kyc || 0.68))),
        users_entered: Math.round((data?.totalActiveUsers || 0) * 0.92)
      }
    ],
    totalNewUsers: data?.newUsersLastMonth || 0,
    completionRate: Math.round((data?.conversionRates.registration_to_kyc || 0.42) * 100),
    avgCompletionTime: (data?.averageTimeInStages.registration || 2.8) + (data?.averageTimeInStages.kyc_completion || 8.5)
  }

  const activationData = {
    activationRate: (data?.conversionRates.kyc_to_first_transfer || 0.238) * 100,
    totalUsers: data?.totalActiveUsers || 0,
    activatedUsers: Math.round((data?.totalActiveUsers || 0) * (data?.conversionRates.kyc_to_first_transfer || 0.238)),
    avgTimeToActivation: data?.averageTimeInStages.first_transfer || 8.5,
    segments: [
      {
        segment: 'power_users' as const,
        name: 'Power Users',
        count: Math.round((data?.totalActiveUsers || 0) * 0.159),
        percentage: 15.9,
        avg_remittances: 4.2,
        avg_days_to_second: 5.8,
        description: 'Más de 2 remesas en sus primeros 14 días',
        color: '#f59e0b'
      }
    ],
    monthlyTrend: [
      { 
        month: 'Últimos 30 días', 
        activation_rate: (data?.conversionRates.kyc_to_first_transfer || 0.238) * 100, 
        new_users: data?.newUsersLastMonth || 0, 
        activated_users: Math.round((data?.newUsersLastMonth || 0) * (data?.conversionRates.kyc_to_first_transfer || 0.238))
      }
    ]
  }

  const retentionData = {
    overallRetention: {
      month_1: 78,
      month_3: 52,
      month_6: 34,
      month_12: 23
    },
    cohortAnalysis: [],
    churnRisks: [],
    inactiveUsers: {
      total: Math.round((data?.totalActiveUsers || 0) * 0.35),
      over_3_months: Math.round((data?.totalActiveUsers || 0) * 0.22),
      over_6_months: Math.round((data?.totalActiveUsers || 0) * 0.16),
      over_12_months: Math.round((data?.totalActiveUsers || 0) * 0.08)
    },
    retentionInsights: []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        isRealData={isRealData}
        dataStatusText={dataStatusText}
        loading={loading}
        onRefetch={handleRefetch}
        onSyncAmplitude={handleSyncAmplitude}
      />

      {/* Status Card */}
      <DataStatusCard
        isRealData={isRealData}
        dataStatusText={dataStatusText}
        data={data}
      />

      {/* Time Filter Controls */}
      <TimeFilterControls
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customDateRange={customDateRange}
        onCustomDateChange={setCustomDateRange}
      />

      {/* Métricas de Usabilidad */}
      <UsabilityMetrics data={data} />

      {/* Insights Críticos */}
      {data?.insights && data.insights.length > 0 && (
        <UsabilityInsights insights={data.insights} />
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="onboarding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Avanzados</h3>
            <p className="text-gray-600">
              Análisis detallado de comportamiento de usuarios próximamente
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Console - Visible on mobile */}
      <ErrorConsole 
        errors={errorLogs} 
        onClear={clearErrorLogs}
      />
    </div>
  )
}
