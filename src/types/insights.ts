
export interface ConversationAnalytic {
  id: string
  conversation_id?: string
  user_id?: string
  conversation_type: 'support' | 'onboarding' | 'retention' | 'complaint'
  issue_category: string
  sentiment_score?: number
  priority_level: 'low' | 'medium' | 'high' | 'critical'
  user_type: 'new_customer' | 'returning_customer' | 'high_value_customer'
  resolution_status: 'pending' | 'resolved' | 'escalated'
  suggested_improvement?: string
  affected_journey_stage?: 'registration' | 'kyc' | 'first_transfer' | 'repeat_transfer'
  created_at: string
  metadata?: any
}

export interface ChurnPrediction {
  id: string
  user_id: string
  churn_probability: number
  risk_level: 'low' | 'medium' | 'high'
  key_factors: string[]
  days_since_last_transfer?: number
  total_transfers?: number
  total_volume_sent?: number
  avg_transfer_amount?: number
  kyc_completion_status?: string
  support_tickets_count?: number
  last_complaint_date?: string
  predicted_churn_date?: string
  intervention_suggested?: string
  created_at: string
  updated_at: string
}

export interface ImprovementSuggestion {
  id: string
  suggestion_text: string
  category: 'product' | 'ux' | 'fees' | 'speed' | 'support'
  frequency_count: number
  first_mentioned: string
  last_mentioned: string
  priority_score: number
  impact_area: 'conversion' | 'retention' | 'satisfaction' | 'ops_efficiency'
  implementation_status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  estimated_impact?: {
    conversion_lift?: number
    retention_improvement?: number
    cost_reduction?: number
  }
  department_owner?: 'product' | 'growth' | 'cs' | 'ops'
  created_at: string
  updated_at: string
}

export interface InsightsDashboardData {
  conversationAnalytics: ConversationAnalytic[]
  churnPredictions: ChurnPrediction[]
  improvementSuggestions: ImprovementSuggestion[]
  totalUsers: number
  activeUsers: number
  supportTickets: number
  avgResolutionTime: number
}
