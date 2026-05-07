-- Fix: embedding column was created as vector(1536) for OpenAI, but we
-- switched to Voyage AI which uses 1024 dimensions. Drop and recreate
-- the column + index + function signature.

-- Drop dependents first
DROP INDEX IF EXISTS public.knowledge_base_embedding_hnsw;
DROP FUNCTION IF EXISTS public.match_knowledge_base_semantic(uuid, vector(1536), float, int);
DROP FUNCTION IF EXISTS public.match_knowledge_base_semantic(uuid, vector(1024), float, int);

-- Reset embedding column to 1024 dimensions
ALTER TABLE public.knowledge_base DROP COLUMN IF EXISTS embedding;
ALTER TABLE public.knowledge_base ADD COLUMN embedding vector(1024);

-- Recreate index
CREATE INDEX knowledge_base_embedding_hnsw
  ON public.knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64)
  WHERE embedding IS NOT NULL;

-- Recreate semantic search function (1024 dim)
CREATE OR REPLACE FUNCTION public.match_knowledge_base_semantic(
  p_tenant_id uuid,
  p_query_embedding vector(1024),
  p_match_threshold float DEFAULT 0.5,
  p_match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  source text,
  file_type text,
  project text,
  metadata jsonb,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tenant_id = p_tenant_id
    ) THEN
      RAISE EXCEPTION 'Access denied: not a member of tenant %', p_tenant_id
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    kb.id, kb.title, kb.content, kb.source, kb.file_type, kb.project, kb.metadata, kb.updated_at,
    1 - (kb.embedding <=> p_query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE kb.tenant_id = p_tenant_id
    AND kb.active = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY kb.embedding <=> p_query_embedding
  LIMIT GREATEST(LEAST(p_match_count, 50), 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_knowledge_base_semantic(uuid, vector(1024), float, int) TO authenticated;
