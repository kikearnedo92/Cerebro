-- ============================================
-- CEREBRO - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  area TEXT,
  rol_empresa TEXT,
  role_system TEXT DEFAULT 'user' CHECK (role_system IN ('user', 'admin', 'super_admin')),
  is_super_admin BOOLEAN DEFAULT false,
  company_name TEXT,
  tenant_id UUID,
  daily_query_limit INTEGER DEFAULT 50,
  queries_used_today INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role_system)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nueva conversación',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);


-- 3. MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  image_data TEXT,
  attachments JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in own conversations" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );


-- 4. KNOWLEDGE BASE
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  project TEXT DEFAULT 'General',
  file_type TEXT,
  source TEXT,
  active BOOLEAN DEFAULT true,
  tenant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read knowledge base" ON public.knowledge_base
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert knowledge" ON public.knowledge_base
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own knowledge" ON public.knowledge_base
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own knowledge" ON public.knowledge_base
  FOR DELETE TO authenticated USING (created_by = auth.uid());


-- 5. INTEGRATIONS
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  integration_id TEXT NOT NULL,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'error')),
  connected_by UUID REFERENCES auth.users(id),
  connected_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, integration_id)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage integrations" ON public.integrations
  FOR ALL TO authenticated USING (true);


-- 6. UPLOADED FILES
CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  processed_content TEXT,
  uploaded_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage files" ON public.uploaded_files
  FOR ALL TO authenticated USING (true);


-- 7. USAGE ANALYTICS
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT,
  sources_used JSONB,
  ai_provider TEXT DEFAULT 'anthropic',
  response_time INTEGER,
  found_relevant_content BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert analytics" ON public.usage_analytics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can read analytics" ON public.usage_analytics
  FOR SELECT TO authenticated USING (true);


-- 8. SEMANTIC SEARCH FUNCTION (used by chat-ai edge function)
CREATE OR REPLACE FUNCTION public.search_knowledge_semantic(
  query_text TEXT,
  project_filter TEXT DEFAULT NULL,
  active_only BOOLEAN DEFAULT true,
  match_count INTEGER DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  project TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ,
  relevance_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.project,
    kb.file_type,
    kb.created_at,
    -- Simple text similarity score based on word matching
    (
      SELECT COUNT(*)::FLOAT / GREATEST(array_length(string_to_array(lower(query_text), ' '), 1), 1)
      FROM unnest(string_to_array(lower(query_text), ' ')) AS word
      WHERE lower(kb.title || ' ' || COALESCE(kb.content, '')) LIKE '%' || word || '%'
    ) AS relevance_score
  FROM public.knowledge_base kb
  WHERE
    (NOT active_only OR kb.active = true)
    AND (project_filter IS NULL OR kb.project = project_filter)
    AND (
      lower(kb.title || ' ' || COALESCE(kb.content, '')) LIKE '%' || lower(split_part(query_text, ' ', 1)) || '%'
      OR lower(kb.title || ' ' || COALESCE(kb.content, '')) LIKE '%' || lower(query_text) || '%'
    )
  ORDER BY relevance_score DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9. KNOWLEDGE BASE STATS FUNCTION
CREATE OR REPLACE FUNCTION public.get_knowledge_base_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_documents', (SELECT COUNT(*) FROM public.knowledge_base),
    'active_documents', (SELECT COUNT(*) FROM public.knowledge_base WHERE active = true),
    'total_projects', (SELECT COUNT(DISTINCT project) FROM public.knowledge_base),
    'file_types', (SELECT json_agg(DISTINCT file_type) FROM public.knowledge_base WHERE file_type IS NOT NULL)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 10. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('cerebro-files', 'cerebro-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cerebro-files');

CREATE POLICY "Anyone can read cerebro files" ON storage.objects
  FOR SELECT USING (bucket_id = 'cerebro-files');

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'cerebro-files');
