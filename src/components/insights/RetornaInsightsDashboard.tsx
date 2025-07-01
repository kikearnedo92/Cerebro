
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, TrendingUp, Users, Target, CheckCircle, AlertCircle, Wifi } from 'lucide-react'
import { useAmplitudeAnalytics } from '@/hooks/useAmplitudeAnalytics'
import { OnboardingAnalytics } from './OnboardingAnalytics'
import { ActivationAnalytics } from './ActivationAnalytics'
import { RetentionAnalytics } from './RetentionAnalytics'
import { TimeFilterControls } from './TimeFilterControls'
import { Badge } from '@/components/ui/badge'

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos REALES de Amplitude...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">Error al cargar datos REALES de Amplitude</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={handleRefetch} variant="outline">Reintentar Conexión</Button>
        </div>
      </div>
    )
  }

  // Determinar el estado de los datos
  const isRealData = data?.status === 'REAL_DATA_FROM_AMPLITUDE'
  const dataStatusIcon = isRealData ? CheckCircle : AlertCircle
  const dataStatusColor = isRealData ? 'text-green-600' : 'text-orange-600'
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Insights de Retorna B2C</h1>
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Analytics de usuarios de la app de remesas</p>
              <Badge variant={isRealData ? "default" : "secondary"} className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                {dataStatusText}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncAmplitude} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Actualizar Datos Reales
          </Button>
          <Button onClick={handleRefetch} variant="outline" size="sm">
            Refrescar
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={`border-l-4 ${isRealData ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <dataStatusIcon className={`w-6 h-6 ${dataStatusColor}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{dataStatusText}</h3>
                {data?.fetchedAt && (
                  <span className="text-sm text-gray-500">
                    • Actualizado: {new Date(data.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{(data?.totalActiveUsers || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Usuarios Activos (REAL)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{(data?.newUsersLastMonth || 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Nuevos Usuarios (REAL)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{data?.usabilityScore || 0}/100</p>
                  <p className="text-sm text-gray-600">Score de Usabilidad</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
