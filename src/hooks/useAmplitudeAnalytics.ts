
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
      
      // Show status message based on connection status
      const statusMessages: Record<string, { title: string; description: string; variant: "default" | "destructive" }> = {
        'MISSING_API_KEYS': {
          title: "⚠️ Configurar API Keys",
          description: "Configura las credenciales de Amplitude para obtener datos reales",
          variant: "destructive"
        },
        'CONNECTION_ERROR_NO_FALLBACK': {
          title: "❌ Error de Conexión",
          description: "No se pudo conectar a Amplitude. Verifica credenciales y conectividad.",
          variant: "destructive"
        },
        'FUNCTION_ERROR': {
          title: "❌ Error del Sistema",
          description: "Error crítico en la función. Revisa los logs de la aplicación.",
          variant: "destructive"
        },
        'REAL_DATA_FROM_AMPLITUDE': {
          title: "✅ Conectado a Amplitude",
          description: "Mostrando datos reales de tu proyecto de Amplitude",
          variant: "default"
        }
      }

      const statusInfo = statusMessages[amplitudeData.status]
      
      if (statusInfo) {
        toast({
          title: statusInfo.title,
          description: statusInfo.description,
          variant: statusInfo.variant
        })
      }
      
    } catch (err) {
      console.error('❌ Error fetching Amplitude data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido de conexión'
      setError(errorMessage)
      
      toast({
        title: "❌ Error de Amplitude",
        description: `No se pudieron cargar los datos: ${errorMessage}`,
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
      
      if (data?.status === 'REAL_DATA_FROM_AMPLITUDE') {
        toast({
          title: "🔄 Datos Actualizados",
          description: "Dashboard actualizado con los últimos datos reales de Amplitude"
        })
      }
      
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
