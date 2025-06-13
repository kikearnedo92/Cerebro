
-- Crear bucket de storage para archivos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('retorna-files', 'retorna-files', false)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas de storage para admins
CREATE POLICY "Admins can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Users can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'retorna-files' AND
  auth.uid() IS NOT NULL
);

-- Habilitar la extensión vector para búsqueda semántica
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla para almacenar chunks de documentos con embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_base(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice para búsqueda vectorial eficiente
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Función para búsqueda semántica de documentos
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  title text,
  chunk_text text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_id,
    kb.title,
    dc.chunk_text,
    dc.chunk_index,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN knowledge_base kb ON dc.document_id = kb.id
  WHERE 
    kb.active = true 
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Habilitar RLS en document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Política para que users puedan ver chunks de documentos activos
CREATE POLICY "Users can view document chunks" ON document_chunks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM knowledge_base kb 
    WHERE kb.id = document_chunks.document_id 
    AND kb.active = true
  )
);

-- Política para que admins puedan insertar chunks
CREATE POLICY "Admins can insert document chunks" ON document_chunks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role_system IN ('admin', 'super_admin')
  )
);
