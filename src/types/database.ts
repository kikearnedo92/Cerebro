export interface Profile {
  id: string
  email: string
  full_name: string
  area: string
  rol_empresa: string
  role_system: string
  last_login: string | null
  created_at: string
  tenant_id?: string
  department?: string
  is_super_admin?: boolean
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
