-- =====================================================================
-- pgvector embeddings for knowledge_base
--
-- Adds semantic search capability so questions like "política de devoluciones"
-- match documents about "reembolsos" — the chat becomes magic instead of
-- doing keyword matching.
--
-- Embedding model: OpenAI text-embedding-3-small (1536 dim, ~$0.02/1M tokens)
-- Index: HNSW for fast similarity search at scale.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

-- HNSW index — faster than IVFFlat at the cost of some memory.
-- m=16, ef_construction=64 is the sweet spot for our scale (<100K docs/tenant).
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_hnsw
  ON public.knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64)
  WHERE embedding IS NOT NULL;

-- Re-embed when content changes
CREATE OR REPLACE FUNCTION public.knowledge_base_invalidate_embedding()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content OR NEW.title IS DISTINCT FROM OLD.title THEN
    NEW.embedding := NULL;
    NEW.embedded_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS knowledge_base_invalidate_embedding_trigger ON public.knowledge_base;
CREATE TRIGGER knowledge_base_invalidate_embedding_trigger
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.knowledge_base_invalidate_embedding();

-- =====================================================================
-- Semantic search RPC — used by api/chat.js (RAG) and MCP server
-- =====================================================================
CREATE OR REPLACE FUNCTION public.match_knowledge_base_semantic(
  p_tenant_id uuid,
  p_query_embedding vector(1536),
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
  -- Validate caller belongs to tenant (or service_role bypass)
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
    kb.id,
    kb.title,
    kb.content,
    kb.source,
    kb.file_type,
    kb.project,
    kb.metadata,
    kb.updated_at,
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

GRANT EXECUTE ON FUNCTION public.match_knowledge_base_semantic(uuid, vector(1536), float, int) TO authenticated;

-- =====================================================================
-- Embedding queue helper — claim N rows that need embedding
-- =====================================================================
CREATE OR REPLACE FUNCTION public.claim_embedding_jobs(p_limit int DEFAULT 20)
RETURNS TABLE (id uuid, title text, content text, tenant_id uuid)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, title, content, tenant_id
  FROM public.knowledge_base
  WHERE embedding IS NULL
    AND active = true
    AND content IS NOT NULL
    AND length(trim(content)) > 0
  ORDER BY updated_at DESC
  LIMIT GREATEST(LEAST(COALESCE(p_limit, 20), 100), 1);
$$;

REVOKE EXECUTE ON FUNCTION public.claim_embedding_jobs(int) FROM PUBLIC;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.claim_embedding_jobs(int);
--   DROP FUNCTION IF EXISTS public.match_knowledge_base_semantic(uuid, vector(1536), float, int);
--   DROP TRIGGER IF EXISTS knowledge_base_invalidate_embedding_trigger ON public.knowledge_base;
--   DROP FUNCTION IF EXISTS public.knowledge_base_invalidate_embedding();
--   DROP INDEX IF EXISTS public.knowledge_base_embedding_hnsw;
--   ALTER TABLE public.knowledge_base
--     DROP COLUMN IF EXISTS embedded_at,
--     DROP COLUMN IF EXISTS embedding_model,
--     DROP COLUMN IF EXISTS embedding;
--   DROP EXTENSION IF EXISTS vector;
