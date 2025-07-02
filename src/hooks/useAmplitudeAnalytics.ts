
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface AmplitudeInsight {
  insight_type: 'friction' | 'churn_prediction' | 'onboarding_optimization' | 'user_growth' | 'growth_analysis' | 'configuration'
  title: string
  description: string
  impact_score: number
  affected_users: number
  stage: string
  recommended_actions: string[]
  created_at: string
}

export interface AmplitudeDashboardData {
  totalActiveUsers: number
  monthlyActiveUsers: number
  newUsersLastMonth: number
  usabilityScore: number
  insights: AmplitudeInsight[]
  conversionRates: {
    registration_to_kyc: number
    kyc_to_first_transfer: number
    first_to_repeat_transfer: number
  }
  averageTimeInStages: {
    kyc_completion: number
    first_transfer: number
    document_upload: number
    registration: number
  }
  churnPredictions: {
    high_risk_users: number
    predicted_churn_rate: number
    top_churn_reasons: string[]
    total_analyzed_users: number
    churn_prevention_actions: string[]
  }
  status: string
  dataSource?: string
  fetchedAt?: string
  apiCallsSuccessful?: boolean
}

export const useAmplitudeAnalytics = () => {
  const [data, setData] = useState<AmplitudeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAmplitudeData = async (timeframe: string = '30d') => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Fetching REAL Amplitude analytics data...')

      const { data: amplitudeData, error: amplitudeError } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'fetch_insights',
          timeframe: timeframe
        }
      })

      if (amplitudeError) {
        console.error('❌ Supabase function error:', amplitudeError)
        throw new Error(`Error de función: ${amplitudeError.message}`)
      }

      if (!amplitudeData) {
        throw new Error('No se recibieron datos de la función')
      }

      console.log('✅ Data received from function:', amplitudeData)
      setData(amplitudeData)
      
      // Show appropriate status message based on data source
      const statusMessages = {
        'REAL_DATA_FROM_AMPLITUDE': {
          title: "✅ Datos Reales Cargados",
          description: `${amplitudeData.totalActiveUsers?.toLocaleString()} usuarios activos desde Amplitude`,
          variant: "default" as const
        },
        'MISSING_API_KEYS': {
          title: "⚠️ Configurar API Keys",
          description: "Configura las credenciales de Amplitude para obtener datos reales",
          variant: "destructive" as const
        },
        'CONNECTION_ISSUE_USING_FALLBACK': {
          title: "⚠️ Problema de Conexión",
          description: "Usando datos de ejemplo. Verifica la conectividad con Amplitude",
          variant: "destructive" as const
        },
        'FUNCTION_ERROR_USING_FALLBACK': {
          title: "❌ Error del Sistema",
          description: "Error en la función. Mostrando datos de ejemplo",
          variant: "destructive" as const
        }
      }

      const statusInfo = statusMessages[amplitudeData.status as keyof typeof statusMessages] || {
        title: "📊 Datos Cargados",
        description: "Dashboard actualizado",
        variant: "default" as const
      }

      toast({
        title: statusInfo.title,
        description: statusInfo.description,
        variant: statusInfo.variant
      })
      
    } catch (err) {
      console.error('❌ Error fetching Amplitude data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido de conexión'
      setError(errorMessage)
      
      // Don't show error toast if we're in development or if this is a network issue
      if (process.env.NODE_ENV !== 'development') {
        toast({
          title: "❌ Error de Amplitude",
          description: `No se pudieron cargar los datos: ${errorMessage}`,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const syncAmplitudeEvents = async () => {
    try {
      console.log('🔄 Refreshing REAL Amplitude data...')
      await fetchAmplitudeData()
      
      toast({
        title: "🔄 Datos Actualizados",
        description: "Dashboard actualizado con los últimos datos disponibles"
      })
      
    } catch (err) {
      console.error('❌ Error refreshing Amplitude data:', err)
      toast({
        title: "❌ Error de actualización",
        description: "No se pudieron actualizar los datos. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  const getHighestImpactInsights = (limit: number = 5) => {
    return data?.insights
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, limit) || []
  }

  useEffect(() => {
    console.log('🚀 Loading Amplitude analytics on component mount...')
    fetchAmplitudeData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchAmplitudeData,
    syncAmplitudeEvents,
    getHighestImpactInsights
  }
}
