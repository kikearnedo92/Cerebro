
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
  errorDetails?: any
}

interface ErrorLog {
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  details?: any
}

export const useAmplitudeAnalytics = () => {
  const [data, setData] = useState<AmplitudeDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])

  const addErrorLog = (level: 'error' | 'warning' | 'info', message: string, details?: any) => {
    const newLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    }
    setErrorLogs(prev => [newLog, ...prev].slice(0, 10)) // Keep only last 10 errors
  }

  const clearErrorLogs = () => {
    setErrorLogs([])
  }

  const fetchAmplitudeData = async (timeframe: string = '30d') => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Fetching REAL Amplitude analytics data...')
      
      addErrorLog('info', 'Iniciando conexión con Amplitude...', { timeframe })

      const { data: amplitudeData, error: amplitudeError } = await supabase.functions.invoke('amplitude-analytics', {
        body: {
          action: 'fetch_insights',
          timeframe: timeframe
        }
      })

      if (amplitudeError) {
        console.error('❌ Supabase function error:', amplitudeError)
        addErrorLog('error', 'Error en función Supabase', amplitudeError)
        throw new Error(`Error de función: ${amplitudeError.message}`)
      }

      if (!amplitudeData) {
        addErrorLog('error', 'No se recibieron datos de la función')
        throw new Error('No se recibieron datos de la función')
      }

      console.log('✅ Data received from function:', amplitudeData)
      setData(amplitudeData)
      
      // Log the actual status and connection details
      addErrorLog('info', `Estado de conexión: ${amplitudeData.status}`, {
        status: amplitudeData.status,
        dataSource: amplitudeData.dataSource,
        apiCallsSuccessful: amplitudeData.apiCallsSuccessful,
        errorDetails: amplitudeData.errorDetails
      })

      // Show specific error details if available
      if (amplitudeData.errorDetails) {
        addErrorLog('error', 'Detalles del error de Amplitude', amplitudeData.errorDetails)
      }

      // Show status message based on connection status
      const statusMessages: Record<string, { title: string; description: string; variant: "default" | "destructive" }> = {
        'MISSING_CREDENTIALS': {
          title: "⚠️ Configurar API Keys",
          description: "Configura las credenciales de Amplitude para obtener datos reales",
          variant: "destructive"
        },
        'API_KEYS_VALID_NO_DATA': {
          title: "🔧 API Keys Válidos - Sin Datos",
          description: "Credenciales válidas pero sin acceso a datos. Verifica permisos en Amplitude",
          variant: "destructive"
        },
        'SYSTEM_ERROR': {
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
      
      addErrorLog('error', 'Error general de conexión', {
        error: errorMessage,
        stack: err instanceof Error ? err.stack : undefined
      })
      
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
      addErrorLog('info', 'Sincronizando datos de Amplitude...')
      await fetchAmplitudeData()
      
      if (data?.status === 'REAL_DATA_FROM_AMPLITUDE') {
        toast({
          title: "🔄 Datos Actualizados",
          description: "Dashboard actualizado con los últimos datos reales de Amplitude"
        })
        addErrorLog('info', 'Datos actualizados exitosamente')
      }
      
    } catch (err) {
      console.error('❌ Error refreshing Amplitude data:', err)
      addErrorLog('error', 'Error al sincronizar datos', err)
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
    errorLogs,
    clearErrorLogs,
    refetch: fetchAmplitudeData,
    syncAmplitudeEvents,
    getHighestImpactInsights
  }
}
