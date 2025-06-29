
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface AmplitudeUserJourney {
  user_id: string
  stage: 'registration' | 'kyc_start' | 'kyc_complete' | 'first_transfer' | 'repeat_user'
  timestamp: string
  time_in_stage: number // minutes
  completion_rate: number
  friction_points: string[]
  drop_off_reason?: string
}

export interface AmplitudeInsight {
  insight_type: 'friction' | 'churn_prediction' | 'onboarding_optimization'
  title: string
  description: string
  impact_score: number
  affected_users: number
  stage: string
  recommended_actions: string[]
  created_at: string
}

export interface AmplitudeDashboardData {
  userJourneys: AmplitudeUserJourney[]
  insights: AmplitudeInsight[]
  conversionRates: {
    registration_to_kyc: number
    kyc_to_first_transfer: number
    first_to_repeat_transfer: number
  }
  averageTimeInStages: {
    kyc_completion: number
    first_transfer: number
  }
  churnPredictions: {
    high_risk_users: number
    predicted_churn_rate: number
    top_churn_reasons: string[]
  }
}

export const useAmplitudeAnalytics = () => {
  const [data, setData] = useState<AmplitudeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAmplitudeData = async () => {
    try {
      setLoading(true)
      console.log('📊 Fetching Amplitude analytics data...')

      // Call our edge function to get Amplitude insights
      const { data: amplitudeData, error: amplitudeError } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'fetch_insights',
          timeframe: '30d'
        }
      })

      if (amplitudeError) {
        throw new Error(amplitudeError.message)
      }

      setData(amplitudeData)
      console.log('✅ Amplitude data loaded successfully')
      
    } catch (err) {
      console.error('❌ Error fetching Amplitude data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de Amplitude",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const syncAmplitudeEvents = async () => {
    try {
      console.log('🔄 Syncing Amplitude events...')
      
      const { error } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'sync_events'
        }
      })

      if (error) throw error

      toast({
        title: "Sincronización completa",
        description: "Los eventos de Amplitude han sido sincronizados"
      })

      // Refresh data after sync
      await fetchAmplitudeData()
      
    } catch (err) {
      console.error('❌ Error syncing Amplitude events:', err)
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los eventos de Amplitude",
        variant: "destructive"
      })
    }
  }

  const analyzeUserJourney = async (userId: string) => {
    try {
      const { data: journeyData, error } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'analyze_user_journey',
          user_id: userId
        }
      })

      if (error) throw error

      return journeyData
      
    } catch (err) {
      console.error('❌ Error analyzing user journey:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchAmplitudeData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchAmplitudeData,
    syncAmplitudeEvents,
    analyzeUserJourney
  }
}
