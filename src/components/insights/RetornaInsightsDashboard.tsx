
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Users, Target } from 'lucide-react'
import { useAmplitudeAnalytics } from '@/hooks/useAmplitudeAnalytics'
import { OnboardingAnalytics } from './OnboardingAnalytics'
import { ActivationAnalytics } from './ActivationAnalytics'
import { RetentionAnalytics } from './RetentionAnalytics'
import { TimeFilterControls } from './TimeFilterControls'
import { DashboardHeader } from './DashboardHeader'
import { DataStatusCard } from './DataStatusCard'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

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

  // Determinar el estado de los datos
  const isRealData = data?.status === 'REAL_DATA_FROM_AMPLITUDE'
  const dataStatusText = isRealData ? 'Datos REALES de Amplitude' : 'Problema de Conexión'

  // Mock data for demonstration - in production this would come from Amplitude
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
        completion_rate: 78,
        avg_time_minutes: 8.5,
        friction_points: ["Calidad de foto ID", "Proceso confuso", "Demora en validación"],
        drop_off_count: Math.round((data?.totalActiveUsers || 0) * 0.22),
        users_entered: Math.round((data?.totalActiveUsers || 0) * 0.92)
      }
    ],
    totalNewUsers: data?.newUsersLastMonth || 0,
    completionRate: 42,
    avgCompletionTime: 29.1
  }

  const activationData = {
    activationRate: 23.8,
    totalUsers: data?.totalActiveUsers || 0,
    activatedUsers: Math.round((data?.totalActiveUsers || 0) * 0.238),
    avgTimeToActivation: 8.5,
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
      { month: 'Últimos 30 días', activation_rate: 23.8, new_users: data?.newUsersLastMonth || 0, activated_users: Math.round((data?.newUsersLastMonth || 0) * 0.238) }
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
