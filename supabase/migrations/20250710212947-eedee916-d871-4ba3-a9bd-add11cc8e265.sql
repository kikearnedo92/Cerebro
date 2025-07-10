-- Agregar función para búsqueda semántica mejorada
CREATE OR REPLACE FUNCTION public.search_knowledge_semantic(
  query_text TEXT,
  project_filter TEXT DEFAULT NULL,
  active_only BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 10
) 
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  project TEXT,
  tags TEXT[],
  file_type TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ,
  relevance_score FLOAT
)
LANGUAGE plpgsql
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
$$;

-- Agregar índices para mejor performance de búsqueda
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_gin ON knowledge_base USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_gin ON knowledge_base USING gin(to_tsvector('spanish', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_project ON knowledge_base(project);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags_gin ON knowledge_base USING gin(tags);

-- Función para stats de knowledge base
CREATE OR REPLACE FUNCTION public.get_knowledge_base_stats()
RETURNS TABLE (
  total_documents INTEGER,
  active_documents INTEGER,
  total_projects INTEGER,
  total_size_mb FLOAT,
  most_common_tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_documents,
    COUNT(*) FILTER (WHERE active = TRUE)::INTEGER as active_documents,
    COUNT(DISTINCT project)::INTEGER as total_projects,
    (SUM(LENGTH(content)) / 1024.0 / 1024.0)::FLOAT as total_size_mb,
    ARRAY(
      SELECT tag 
      FROM (
        SELECT UNNEST(tags) as tag, COUNT(*) as cnt
        FROM knowledge_base 
        WHERE active = TRUE
        GROUP BY tag
        ORDER BY cnt DESC
        LIMIT 10
      ) t
    ) as most_common_tags
  FROM knowledge_base;
END;
$$;