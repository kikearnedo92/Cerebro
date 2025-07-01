
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
        throw new Error(amplitudeError.message)
      }

      if (!amplitudeData) {
        throw new Error('No data received from Amplitude')
      }

      console.log('✅ REAL Amplitude data received:', amplitudeData)
      setData(amplitudeData)
      
      // Show status toast
      if (amplitudeData.status === 'REAL_DATA_FROM_AMPLITUDE') {
        toast({
          title: "✅ Datos Reales Cargados",
          description: `${amplitudeData.totalActiveUsers?.toLocaleString()} usuarios activos desde Amplitude`,
        })
      } else {
        toast({
          title: "⚠️ Problema de Conexión",
          description: "Verifica las API keys de Amplitude en configuración",
          variant: "destructive"
        })
      }
      
    } catch (err) {
      console.error('❌ Error fetching REAL Amplitude data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "❌ Error de Amplitude",
        description: `No se pudieron cargar los datos reales: ${errorMessage}`,
        variant: "destructive"
      })
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
        description: "Datos reales de Amplitude actualizados exitosamente"
      })
      
    } catch (err) {
      console.error('❌ Error refreshing Amplitude data:', err)
      toast({
        title: "❌ Error de actualización",
        description: "No se pudieron actualizar los datos de Amplitude",
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
    console.log('🚀 Loading REAL Amplitude analytics on mount...')
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
