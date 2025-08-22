-- Enable useful extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a simple text search function using trigram similarity and ILIKE
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
) 
LANGUAGE plpgsql
STABLE
AS $$
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
    -- Calculate relevance score based on text similarity and matching
    (
      CASE 
        WHEN LOWER(kb.title) ILIKE '%' || LOWER(query_text) || '%' THEN 0.9
        WHEN LOWER(kb.content) ILIKE '%' || LOWER(query_text) || '%' THEN 0.8
        WHEN EXISTS (
          SELECT 1 FROM unnest(COALESCE(kb.tags, ARRAY[]::text[])) AS tag 
          WHERE LOWER(tag) ILIKE '%' || LOWER(query_text) || '%'
        ) THEN 0.6
        ELSE GREATEST(
          similarity(LOWER(kb.title), LOWER(query_text)),
          similarity(LOWER(left(kb.content, 500)), LOWER(query_text))
        )
      END
    )::real AS relevance_score
  FROM public.knowledge_base kb
  WHERE 
    (NOT active_only OR kb.active = true)
    AND (project_filter IS NULL OR kb.project = project_filter)
    AND (
      LOWER(kb.title) ILIKE '%' || LOWER(query_text) || '%'
      OR LOWER(kb.content) ILIKE '%' || LOWER(query_text) || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(kb.tags, ARRAY[]::text[])) AS tag 
        WHERE LOWER(tag) ILIKE '%' || LOWER(query_text) || '%'
      )
      OR similarity(LOWER(kb.title), LOWER(query_text)) > 0.2
      OR similarity(LOWER(left(kb.content, 500)), LOWER(query_text)) > 0.1
    )
  ORDER BY relevance_score DESC, kb.created_at DESC
  LIMIT match_count;
END;
$$;

-- Enhanced stats function
CREATE OR REPLACE FUNCTION public.get_knowledge_base_stats()
RETURNS TABLE (
  total_documents integer,
  active_documents integer,
  total_projects integer,
  total_size_mb numeric,
  most_common_tags text[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH base_stats AS (
    SELECT 
      COUNT(*)::integer AS total_docs,
      COUNT(*) FILTER (WHERE active = true)::integer AS active_docs,
      COUNT(DISTINCT project)::integer AS total_projs,
      COALESCE(SUM(octet_length(COALESCE(content, '')))::numeric / 1024.0 / 1024.0, 0) AS size_mb
    FROM public.knowledge_base
  ),
  tag_stats AS (
    SELECT ARRAY_AGG(tag ORDER BY tag_count DESC) AS common_tags
    FROM (
      SELECT tag, COUNT(*) AS tag_count
      FROM public.knowledge_base
      CROSS JOIN unnest(COALESCE(tags, ARRAY[]::text[])) AS tag
      WHERE active = true AND tag IS NOT NULL AND tag != ''
      GROUP BY tag
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) t
  )
  SELECT 
    b.total_docs,
    b.active_docs,
    b.total_projs,
    b.size_mb::numeric(12,2),
    COALESCE(t.common_tags, ARRAY[]::text[])
  FROM base_stats b
  CROSS JOIN tag_stats t;
END;
$$;