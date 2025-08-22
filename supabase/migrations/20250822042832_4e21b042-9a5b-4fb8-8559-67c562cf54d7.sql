-- Drop and recreate the function with proper signature
DROP FUNCTION IF EXISTS public.search_knowledge_semantic(text, text, boolean, integer);

-- Create the semantic search function with trigram similarity
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