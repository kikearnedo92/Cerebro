export interface Profile {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  last_login: string | null
  created_at: string
  updated_at?: string
  tenant_id?: string
  department?: string
  is_super_admin?: boolean
  daily_query_limit?: number
  queries_used_today?: number
  last_query_reset?: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  domain?: string
  plan: string
  settings: any
  branding: any
  subscription_status: string
  trial_ends_at?: string
  is_internal: boolean
  max_users: number
  max_storage_gb: number
  max_monthly_queries: number
  areas: string[]
  admin_email?: string
  created_at: string
  updated_at: string
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  project: string
  tags: string[]
  file_url?: string
  active: boolean
  created_at: string
  created_by: string
  external_id?: string
  source?: string
  file_type?: string
  user_id?: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  chunk_text: string
  chunk_index: number
  embedding?: number[]
  metadata: any
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: string
  content: string
  timestamp: string
  attachments?: any
}

export interface Conversation {
  id: string
  title: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: string
  user_id: string
  filename: string
  file_url: string
  file_type: string
  processed_content?: string
  created_at: string
}

export interface UsageAnalytics {
  id: string
  user_id?: string
  query: string
  response_time?: number
  ai_provider?: string
  sources_used?: any
  rating?: number
  created_at?: string
}

export interface IntegrationsConfig {
  id: string
  user_id: string
  integration_type: string
  config: any
  status: string
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface ConversationAnalytic {
  id: string
  conversation_id?: string
  user_id?: string
  conversation_type: string
  issue_category: string
  sentiment_score?: number
  priority_level: string
  user_type: string
  resolution_status: string
  suggested_improvement?: string
  affected_journey_stage?: string
  created_at: string
  metadata?: any
}

export interface ChurnPrediction {
  id: string
  user_id: string
  churn_probability: number
  risk_level: string
  key_factors: any
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
  category: string
  frequency_count: number
  first_mentioned: string
  last_mentioned: string
  priority_score: number
  impact_area: string
  implementation_status: string
  estimated_impact?: any
  department_owner?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  display_name: string
  description?: string
  features: string[]
  branding?: any
  is_commercial: boolean
  created_at: string
  updated_at: string
}

export interface FeatureFlagEnhanced {
  id: string
  name: string
  display_name: string
  description?: string
  module: string
  is_global: boolean
  requires_commercial: boolean
  created_at: string
}

export interface TenantFeatureFlagEnhanced {
  id: string
  tenant_id: string
  feature_flag_id: string
  is_enabled: boolean
  granted_by?: string
  created_at: string
}
