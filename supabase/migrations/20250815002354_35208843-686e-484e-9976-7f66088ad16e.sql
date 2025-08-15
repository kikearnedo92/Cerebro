-- Create profiles table with trigger for new users
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'General',
  rol_empresa TEXT NOT NULL DEFAULT 'Usuario', 
  role_system TEXT NOT NULL DEFAULT 'user',
  department TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  last_login TIMESTAMP WITH TIME ZONE,
  tenant_id UUID,
  is_super_admin BOOLEAN DEFAULT false,
  daily_query_limit INTEGER DEFAULT 50,
  queries_used_today INTEGER DEFAULT 0,
  last_query_reset DATE DEFAULT CURRENT_DATE,
  can_access_cerebro BOOLEAN DEFAULT false,
  can_access_nucleo BOOLEAN DEFAULT true
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Allow authenticated users to view profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id OR auth.role() = 'authenticated');

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  attachments JSONB,
  image_data TEXT
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Users can manage messages in own conversations" ON public.messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  ));

-- Create knowledge_base table
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  project TEXT DEFAULT 'default',
  tags TEXT[],
  created_by UUID NOT NULL,
  user_id UUID,
  file_type TEXT DEFAULT 'document',
  file_url TEXT,
  external_id TEXT,
  source TEXT DEFAULT 'manual',
  active BOOLEAN DEFAULT true,
  embedding vector,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS on knowledge_base
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for knowledge_base
CREATE POLICY "Authenticated users can view knowledge base" ON public.knowledge_base
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage knowledge" ON public.knowledge_base
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create usage_analytics table
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  query TEXT NOT NULL,
  ai_provider TEXT DEFAULT 'openai',
  response_time INTEGER,
  sources_used JSONB,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS on usage_analytics
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view own analytics" ON public.usage_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics" ON public.usage_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create company_config table
CREATE TABLE public.company_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL DEFAULT 'Retorna',
  voice_tone TEXT NOT NULL DEFAULT 'Profesional pero cercano, innovador en fintech',
  system_prompt TEXT NOT NULL DEFAULT 'Eres CEREBRO AI, el asistente inteligente de Retorna...',
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#7C3AED", "secondary": "#A855F7"}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on company_config
ALTER TABLE public.company_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_config
CREATE POLICY "all_users_read_config" ON public.company_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create uploaded_files table
CREATE TABLE public.uploaded_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  processed_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Enable RLS on uploaded_files
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for uploaded_files
CREATE POLICY "Users manage own files" ON public.uploaded_files
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT := 'user';
    is_admin BOOLEAN := FALSE;
BEGIN
    -- Determinar rol basado en email
    IF NEW.email = 'eduardo@retorna.app' OR NEW.email = 'eduardoarnedog@gmail.com' THEN
        user_role := 'super_admin';
        is_admin := TRUE;
    ELSIF NEW.email LIKE '%@retorna.app' THEN
        user_role := 'admin';
        is_admin := TRUE;
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        role_system,
        is_super_admin,
        daily_query_limit
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        is_admin,
        CASE WHEN is_admin THEN 1000 ELSE 50 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create search function for knowledge base
CREATE OR REPLACE FUNCTION public.search_knowledge_semantic(
  query_text TEXT,
  project_filter TEXT DEFAULT NULL,
  active_only BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  project TEXT,
  tags TEXT[],
  file_type TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.content,
    kb.project,
    kb.tags,
    kb.file_type,
    kb.file_url,
    kb.created_at,
    -- Simple text similarity scoring
    (
      CASE 
        WHEN LOWER(kb.title) LIKE '%' || LOWER(query_text) || '%' THEN 1.0
        WHEN LOWER(kb.content) LIKE '%' || LOWER(query_text) || '%' THEN 0.8
        WHEN EXISTS (
          SELECT 1 FROM UNNEST(kb.tags) tag 
          WHERE LOWER(tag) LIKE '%' || LOWER(query_text) || '%'
        ) THEN 0.6
        ELSE 0.3
      END
    )::FLOAT as relevance_score
  FROM knowledge_base kb
  WHERE 
    (NOT active_only OR kb.active = TRUE)
    AND (project_filter IS NULL OR kb.project = project_filter)
    AND (
      LOWER(kb.title) LIKE '%' || LOWER(query_text) || '%'
      OR LOWER(kb.content) LIKE '%' || LOWER(query_text) || '%'
      OR EXISTS (
        SELECT 1 FROM UNNEST(kb.tags) tag 
        WHERE LOWER(tag) LIKE '%' || LOWER(query_text) || '%'
      )
    )
  ORDER BY relevance_score DESC, kb.created_at DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;