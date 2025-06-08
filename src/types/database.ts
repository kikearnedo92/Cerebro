
export interface Profile {
  id: string
  email: string
  full_name: string
  area: 'ATC' | 'Research' | 'Onboarding' | 'Data' | 'Management' | 'Otro'
  rol_empresa: 'Agente' | 'Analista' | 'Manager' | 'Director'
  role_system: 'admin' | 'user'
  created_at: string
  last_login?: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  attachments?: any
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
