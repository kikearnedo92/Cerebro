-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a combined tsvector index for Spanish FTS
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fts_spanish
ON public.knowledge_base
USING GIN (to_tsvector('spanish', unaccent(coalesce(title,'') || ' ' || coalesce(content,''))));

-- Semantic-like full text search function (no external calls required)
CREATE OR REPLACE FUNCTION public.search_knowledge_semantic(
  query_text text,
  project_filter text DEFAULT NULL,
  active_only boolean DEFAULT true,
  match_count integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  project text,
  tags text[],
  file_type text,
  file_url text,
  created_at timestamptz,
  relevance_score real
) AS $$
  SELECT 
    kb.id,
    kb.title,
    kb.content,
    kb.project,
    kb.tags,
    kb.file_type,
    kb.file_url,
    kb.created_at,
    ts_rank_cd(
      to_tsvector('spanish', unaccent(coalesce(kb.title,'') || ' ' || coalesce(kb.content,''))),
      plainto_tsquery('spanish', unaccent(query_text))
    ) AS relevance_score
  FROM public.knowledge_base kb
  WHERE (
    (project_filter IS NULL OR kb.project = project_filter)
    AND (NOT active_only OR kb.active = true)
    AND to_tsvector('spanish', unaccent(coalesce(kb.title,'') || ' ' || coalesce(kb.content,'')))
        @@ plainto_tsquery('spanish', unaccent(query_text))
  )
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT match_count;
$$ LANGUAGE sql STABLE;

-- Basic stats function used by UI
CREATE OR REPLACE FUNCTION public.get_knowledge_base_stats()
RETURNS TABLE (
  total_documents integer,
  active_documents integer,
  total_projects integer,
  total_size_mb numeric,
  most_common_tags text[]
) AS $$
  WITH base AS (
    SELECT 
      count(*) FILTER (WHERE true) AS total_documents,
      count(*) FILTER (WHERE active = true) AS active_documents,
      count(DISTINCT project) AS total_projects,
      sum(octet_length(coalesce(content,'')))::numeric / 1024 / 1024 AS total_size_mb
    FROM public.knowledge_base
  ), tags_agg AS (
    SELECT 
      unnest(tags) AS tag,
      count(*) AS cnt
    FROM public.knowledge_base
    WHERE tags IS NOT NULL
    GROUP BY 1
    ORDER BY cnt DESC
    LIMIT 10
  )
  SELECT 
    b.total_documents,
    b.active_documents,
    b.total_projects,
    COALESCE(b.total_size_mb, 0)::numeric(12,2) AS total_size_mb,
    COALESCE(array_agg(t.tag), ARRAY[]::text[]) AS most_common_tags
  FROM base b
  LEFT JOIN tags_agg t ON true
  GROUP BY 1,2,3,4;
$$ LANGUAGE sql STABLE;

-- Permissions: rely on existing RLS policies (functions run with caller rights)
