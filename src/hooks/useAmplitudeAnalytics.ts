
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface AmplitudeUserJourney {
  user_id: string
  stage: 'registration' | 'kyc_start' | 'kyc_document_upload' | 'kyc_complete' | 'first_transfer' | 'repeat_user'
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

export interface OnboardingAnalysis {
  stage_metrics: {
    [stage: string]: {
      average_time_minutes: number
      completion_rate: number
      friction_incidents: number
      drop_off_count: number
      user_count: number
      friction_rate: number
    }
  }
  problematic_stages: Array<{
    stage: string
    issues: string[]
    metrics: any
  }>
  overall_onboarding_health: 'good' | 'needs_attention' | 'critical'
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
  onboardingAnalysis: OnboardingAnalysis
  usabilityScore: number
}

export const useAmplitudeAnalytics = () => {
  const [data, setData] = useState<AmplitudeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAmplitudeData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Fetching comprehensive Amplitude analytics data...')

      // Call our enhanced edge function to get Amplitude insights
      const { data: amplitudeData, error: amplitudeError } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'fetch_insights',
          timeframe: '30d'
        }
      })

      if (amplitudeError) {
        throw new Error(amplitudeError.message)
      }

      if (!amplitudeData) {
        throw new Error('No data received from Amplitude')
      }

      setData(amplitudeData)
      console.log('✅ Amplitude analytics data loaded successfully')
      console.log(`📈 Usability Score: ${amplitudeData.usabilityScore}/100`)
      console.log(`🚨 High Risk Users: ${amplitudeData.churnPredictions.high_risk_users}`)
      console.log(`⚡ Insights Generated: ${amplitudeData.insights.length}`)
      
    } catch (err) {
      console.error('❌ Error fetching Amplitude data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      toast({
        title: "Error de Amplitude",
        description: `No se pudieron cargar los datos de análisis: ${errorMessage}`,
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
        description: "Los eventos de Amplitude han sido sincronizados exitosamente"
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

  const getInsightsByType = (type: 'friction' | 'churn_prediction' | 'onboarding_optimization') => {
    return data?.insights.filter(insight => insight.insight_type === type) || []
  }

  const getHighestImpactInsights = (limit: number = 5) => {
    return data?.insights
      .sort((a, b) => b.impact_score - a.impact_score)
      .slice(0, limit) || []
  }

  const getOnboardingHealthStatus = () => {
    return data?.onboardingAnalysis.overall_onboarding_health || 'good'
  }

  const getMostProblematicStage = () => {
    const problematic = data?.onboardingAnalysis.problematic_stages || []
    return problematic.length > 0 ? problematic[0] : null
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
    analyzeUserJourney,
    getInsightsByType,
    getHighestImpactInsights,
    getOnboardingHealthStatus,
    getMostProblematicStage
  }
}
