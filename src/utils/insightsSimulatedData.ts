
import { ConversationAnalytic, ChurnPrediction, ImprovementSuggestion } from '@/types/insights'

// Datos simulados específicos para industria de remesas B2C
export const simulatedConversationAnalytics: ConversationAnalytic[] = [
  {
    id: '1',
    conversation_type: 'complaint',
    issue_category: 'transfer_delay',
    sentiment_score: -0.8,
    priority_level: 'high',
    user_type: 'returning_customer',
    resolution_status: 'pending',
    suggested_improvement: 'Implementar notificaciones en tiempo real del estatus de transferencia',
    affected_journey_stage: 'repeat_transfer',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
    metadata: { transfer_amount: 500, destination_country: 'Mexico' }
  },
  {
    id: '2',
    conversation_type: 'support',
    issue_category: 'kyc_issues',
    sentiment_score: -0.6,
    priority_level: 'critical',
    user_type: 'new_customer',
    resolution_status: 'escalated',
    suggested_improvement: 'Simplificar proceso KYC con verificación biométrica',
    affected_journey_stage: 'kyc',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
    metadata: { signup_date: '2024-01-15', document_type: 'passport' }
  },
  {
    id: '3',
    conversation_type: 'complaint',
    issue_category: 'high_fees',
    sentiment_score: -0.7,
    priority_level: 'high',
    user_type: 'high_value_customer',
    resolution_status: 'resolved',
    suggested_improvement: 'Crear programa de loyalty con fees reducidos',
    affected_journey_stage: 'first_transfer',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
    metadata: { monthly_volume: 2500, tier: 'gold' }
  },
  {
    id: '4',
    conversation_type: 'support',
    issue_category: 'app_crashes',
    sentiment_score: -0.9,
    priority_level: 'critical',
    user_type: 'returning_customer',
    resolution_status: 'pending',
    suggested_improvement: 'Optimizar performance de la app en dispositivos Android antiguos',
    affected_journey_stage: 'repeat_transfer',
    created_at: new Date(Date.now() - 345600000).toISOString(), // 4 días atrás
    metadata: { device_type: 'Android 8.0', crash_frequency: 'high' }
  },
  {
    id: '5',
    conversation_type: 'onboarding',
    issue_category: 'confusing_ui',
    sentiment_score: -0.4,
    priority_level: 'medium',
    user_type: 'new_customer',
    resolution_status: 'resolved',
    suggested_improvement: 'Agregar tutorial interactivo para primera transferencia',
    affected_journey_stage: 'first_transfer',
    created_at: new Date(Date.now() - 432000000).toISOString(), // 5 días atrás
    metadata: { completion_rate: 0.3, drop_off_step: 'recipient_details' }
  }
]

export const simulatedChurnPredictions: ChurnPrediction[] = [
  {
    id: '1',
    user_id: 'user_1',
    churn_probability: 0.8534,
    risk_level: 'high',
    key_factors: ['No transfers in 45 days', 'Failed KYC twice', 'App crashes reported'],
    days_since_last_transfer: 45,
    total_transfers: 2,
    total_volume_sent: 850,
    avg_transfer_amount: 425,
    kyc_completion_status: 'failed',
    support_tickets_count: 3,
    last_complaint_date: new Date(Date.now() - 2592000000).toISOString(), // 30 días atrás
    predicted_churn_date: new Date(Date.now() + 604800000).toISOString(), // 7 días adelante
    intervention_suggested: 'Contacto proactivo de CS + oferta de fee gratuito para próxima transferencia',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user_2',
    churn_probability: 0.6823,
    risk_level: 'medium',
    key_factors: ['Decreased transfer frequency', 'Complained about fees', 'Using competitor'],
    days_since_last_transfer: 21,
    total_transfers: 12,
    total_volume_sent: 6500,
    avg_transfer_amount: 542,
    kyc_completion_status: 'completed',
    support_tickets_count: 2,
    predicted_churn_date: new Date(Date.now() + 1209600000).toISOString(), // 14 días adelante
    intervention_suggested: 'Oferta personalizada con descuento en fees + recordatorio de beneficios',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user_3',
    churn_probability: 0.9156,
    risk_level: 'high',
    key_factors: ['Multiple failed transfers', 'Poor app rating', 'Contacted competitor'],
    days_since_last_transfer: 67,
    total_transfers: 1,
    total_volume_sent: 300,
    avg_transfer_amount: 300,
    kyc_completion_status: 'pending',
    support_tickets_count: 5,
    last_complaint_date: new Date(Date.now() - 1728000000).toISOString(), // 20 días atrás
    predicted_churn_date: new Date(Date.now() + 259200000).toISOString(), // 3 días adelante
    intervention_suggested: 'Intervención urgente: llamada personal + resolución express de KYC',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const simulatedImprovementSuggestions: ImprovementSuggestion[] = [
  {
    id: '1',
    suggestion_text: 'Implementar notificaciones push en tiempo real del estatus de transferencias',
    category: 'product',
    frequency_count: 23,
    first_mentioned: new Date(Date.now() - 2592000000).toISOString(), // 30 días atrás
    last_mentioned: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
    priority_score: 95,
    impact_area: 'retention',
    implementation_status: 'pending',
    estimated_impact: {
      retention_improvement: 0.15,
      conversion_lift: 0.08
    },
    department_owner: 'product',
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    suggestion_text: 'Reducir fees para transferencias menores a $100 USD',
    category: 'fees',
    frequency_count: 31,
    first_mentioned: new Date(Date.now() - 3456000000).toISOString(), // 40 días atrás
    last_mentioned: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
    priority_score: 89,
    impact_area: 'conversion',
    implementation_status: 'in_progress',
    estimated_impact: {
      conversion_lift: 0.22,
      retention_improvement: 0.12
    },
    department_owner: 'growth',
    created_at: new Date(Date.now() - 3456000000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    suggestion_text: 'Simplificar proceso KYC con verificación biométrica automática',
    category: 'ux',
    frequency_count: 18,
    first_mentioned: new Date(Date.now() - 1728000000).toISOString(), // 20 días atrás
    last_mentioned: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
    priority_score: 92,
    impact_area: 'conversion',
    implementation_status: 'pending',
    estimated_impact: {
      conversion_lift: 0.18,
      cost_reduction: 0.25
    },
    department_owner: 'product',
    created_at: new Date(Date.now() - 1728000000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    suggestion_text: 'Agregar chat en vivo 24/7 para soporte inmediato',
    category: 'support',
    frequency_count: 14,
    first_mentioned: new Date(Date.now() - 1209600000).toISOString(), // 14 días atrás
    last_mentioned: new Date(Date.now() - 432000000).toISOString(), // 5 días atrás
    priority_score: 76,
    impact_area: 'satisfaction',
    implementation_status: 'pending',
    estimated_impact: {
      retention_improvement: 0.10,
      cost_reduction: 0.15
    },
    department_owner: 'cs',
    created_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    suggestion_text: 'Optimizar velocidad de transferencias a México y Colombia',
    category: 'speed',
    frequency_count: 27,
    first_mentioned: new Date(Date.now() - 2160000000).toISOString(), // 25 días atrás
    last_mentioned: new Date(Date.now() - 345600000).toISOString(), // 4 días atrás
    priority_score: 88,
    impact_area: 'retention',
    implementation_status: 'in_progress',
    estimated_impact: {
      retention_improvement: 0.20,
      conversion_lift: 0.12
    },
    department_owner: 'ops',
    created_at: new Date(Date.now() - 2160000000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Función para generar métricas simuladas dinámicas
export const generateSimulatedMetrics = () => {
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  return {
    totalUsers: 15847,
    activeUsers: 8923,
    supportTickets: 234,
    avgResolutionTime: 4.2, // horas
    weeklyGrowth: 12.4, // %
    churnRate: 18.7, // %
    npsScore: 7.2,
    conversionRate: 34.8, // %
    avgTransferAmount: 425.50,
    topDestinations: ['Mexico', 'Colombia', 'Guatemala', 'El Salvador', 'Honduras']
  }
}
