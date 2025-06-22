
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ConversationAnalytic, ChurnPrediction, ImprovementSuggestion, InsightsDashboardData } from '@/types/insights'
import { 
  simulatedConversationAnalytics, 
  simulatedChurnPredictions, 
  simulatedImprovementSuggestions,
  generateSimulatedMetrics
} from '@/utils/insightsSimulatedData'
import { toast } from '@/hooks/use-toast'

export const useInsightsData = () => {
  const [data, setData] = useState<InsightsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsightsData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching insights data...')

      // Por ahora usamos datos simulados, pero estructura lista para datos reales
      const [
        conversationAnalytics,
        churnPredictions, 
        improvementSuggestions
      ] = await Promise.all([
        fetchConversationAnalytics(),
        fetchChurnPredictions(),
        fetchImprovementSuggestions()
      ])

      const metrics = generateSimulatedMetrics()

      setData({
        conversationAnalytics,
        churnPredictions,
        improvementSuggestions,
        totalUsers: metrics.totalUsers,
        activeUsers: metrics.activeUsers,
        supportTickets: metrics.supportTickets,
        avgResolutionTime: metrics.avgResolutionTime
      })

      console.log('✅ Insights data loaded successfully')
      
    } catch (err) {
      console.error('❌ Error fetching insights data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      toast({
        title: "Error",
        description: "No se pudieron cargar los insights",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchConversationAnalytics = async (): Promise<ConversationAnalytic[]> => {
    // En desarrollo usar datos simulados
    if (process.env.NODE_ENV === 'development') {
      return simulatedConversationAnalytics
    }

    // Para producción, consultar base de datos real
    const { data, error } = await supabase
      .from('conversation_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data || []
  }

  const fetchChurnPredictions = async (): Promise<ChurnPrediction[]> => {
    // En desarrollo usar datos simulados
    if (process.env.NODE_ENV === 'development') {
      return simulatedChurnPredictions
    }

    const { data, error } = await supabase
      .from('churn_predictions')
      .select('*')
      .order('churn_probability', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  }

  const fetchImprovementSuggestions = async (): Promise<ImprovementSuggestion[]> => {
    // En desarrollo usar datos simulados
    if (process.env.NODE_ENV === 'development') {
      return simulatedImprovementSuggestions
    }

    const { data, error } = await supabase
      .from('improvement_suggestions')
      .select('*')
      .order('priority_score', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  }

  const updateSuggestionStatus = async (id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('improvement_suggestions')
        .update({ 
          implementation_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Actualizar estado local
      setData(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          improvementSuggestions: prev.improvementSuggestions.map(suggestion =>
            suggestion.id === id 
              ? { ...suggestion, implementation_status: status, updated_at: new Date().toISOString() }
              : suggestion
          )
        }
      })

      toast({
        title: "Estado actualizado",
        description: "El estado de la sugerencia ha sido actualizado correctamente"
      })

    } catch (err) {
      console.error('Error updating suggestion status:', err)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchInsightsData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchInsightsData,
    updateSuggestionStatus
  }
}
