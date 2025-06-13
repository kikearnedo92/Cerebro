
-- Crear tabla para configuraciones de integraciones
CREATE TABLE public.integrations_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  integration_type text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'disconnected',
  last_sync timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Agregar campos faltantes a knowledge_base para Notion
ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS file_type text DEFAULT 'document',
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Habilitar RLS en integrations_config
ALTER TABLE public.integrations_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para integrations_config
CREATE POLICY "Users can view their own integration configs" 
  ON public.integrations_config 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integration configs" 
  ON public.integrations_config 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integration configs" 
  ON public.integrations_config 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integration configs" 
  ON public.integrations_config 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Agregar campo para límite de consultas diarias en profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_query_limit integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS queries_used_today integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_query_reset date DEFAULT CURRENT_DATE;

-- Habilitar RLS en todas las tablas si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles (permitir a usuarios ver su propio perfil y a admins ver todos)
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role_system = 'admin' OR p.role_system = 'super_admin' OR p.is_super_admin = true)
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role_system = 'admin' OR p.role_system = 'super_admin' OR p.is_super_admin = true)
    )
  );

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
CREATE POLICY "Users can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
CREATE POLICY "Users can create messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Políticas para knowledge_base (permitir a todos los usuarios autenticados leer, solo admins escribir)
DROP POLICY IF EXISTS "Authenticated users can view knowledge base" ON public.knowledge_base;
CREATE POLICY "Authenticated users can view knowledge base" 
  ON public.knowledge_base 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage knowledge base" ON public.knowledge_base;
CREATE POLICY "Admins can manage knowledge base" 
  ON public.knowledge_base 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role_system = 'admin' OR p.role_system = 'super_admin' OR p.is_super_admin = true)
    )
  );
