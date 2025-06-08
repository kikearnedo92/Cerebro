
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'user';
  ultimo_acceso?: Date;
  fecha_creacion: Date;
  activo: boolean;
  invitado_por?: string;
}

export interface Project {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  activo: boolean;
  orden_display: number;
}

export interface KnowledgeBase {
  id: string;
  titulo: string;
  contenido: string;
  project_id: string;
  tipo_contenido: 'archivo' | 'manual';
  archivo_url?: string;
  tags: string[];
  fecha_creacion: Date;
  creado_por: string;
  activo: boolean;
  version: number;
  project?: Project;
}

export interface Conversation {
  id: string;
  user_id: string;
  titulo: string;
  fecha_creacion: Date;
  ultima_actualizacion: Date;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  tipo: 'user' | 'ai';
  contenido: string;
  timestamp: Date;
  sources_used?: string[];
  rating?: 'up' | 'down';
}

export interface UsageAnalytics {
  id: string;
  user_id: string;
  fecha: Date;
  total_consultas: number;
  conversation_duration: number;
  topics_consulted: string[];
}

export interface ChatResponse {
  message: string;
  sources: string[];
  conversation_id: string;
}

export interface AuthUser {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol?: 'admin' | 'user';
}

export interface DashboardStats {
  total_consultas_hoy: number;
  total_consultas_semana: number;
  total_consultas_mes: number;
  usuarios_activos: number;
  proyectos_mas_consultados: Array<{
    proyecto: string;
    consultas: number;
  }>;
  rating_promedio: number;
  usage_trends: Array<{
    fecha: string;
    consultas: number;
  }>;
  top_topics: Array<{
    topic: string;
    count: number;
  }>;
}
