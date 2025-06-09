
-- Primero eliminar políticas existentes que puedan estar en conflicto
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Everyone can view active knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Admin can manage knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can view their own files" ON uploaded_files;
DROP POLICY IF EXISTS "Users can upload their own files" ON uploaded_files;
DROP POLICY IF EXISTS "Admin can view all files" ON uploaded_files;

-- Asegurar permisos de admin para eduardo@retorna.app
UPDATE profiles 
SET role_system = 'admin' 
WHERE email = 'eduardo@retorna.app';

-- Habilitar RLS en todas las tablas
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Recrear políticas para conversations
CREATE POLICY "Users can view own conversations" 
  ON conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
  ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
  ON conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para messages
CREATE POLICY "Users can view conversation messages" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversation messages" 
  ON messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Políticas para knowledge_base
CREATE POLICY "View active knowledge base" 
  ON knowledge_base FOR SELECT 
  USING (active = true);

CREATE POLICY "Admin manage knowledge base" 
  ON knowledge_base FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_system = 'admin'
    )
  );

-- Políticas para uploaded_files
CREATE POLICY "Users view own files" 
  ON uploaded_files FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users upload own files" 
  ON uploaded_files FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin view all files" 
  ON uploaded_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_system = 'admin'
    )
  );

-- Crear tabla para analytics si no existe
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response_time INTEGER,
  ai_provider TEXT DEFAULT 'openai',
  sources_used JSONB,
  rating INTEGER CHECK (rating IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin view analytics" 
  ON usage_analytics FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_system = 'admin'
    )
  );

CREATE POLICY "Users create analytics" 
  ON usage_analytics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Crear storage bucket para archivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('retorna-files', 'retorna-files', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage (eliminar existentes primero)
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;

CREATE POLICY "Allow file uploads" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'retorna-files');

CREATE POLICY "Allow file viewing" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'retorna-files');

CREATE POLICY "Admin delete files" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'retorna-files' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_system = 'admin'
    )
  );
