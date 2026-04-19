-- Day 1 — Notion sync fixes
-- 1. Unique constraint for (tenant_id, source) so upserts from /api/integrations/notion/sync work.
-- 2. Nullable metadata JSONB column to store Notion page properties (status, tags, dates, url).
-- Idempotent: every statement guarded for re-runs.

-- 1. Unique partial index on (tenant_id, source). Partial because rows without a source
-- (e.g. manual uploads) should remain insertable without collision.
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_base_tenant_source_uniq
  ON public.knowledge_base (tenant_id, source)
  WHERE source IS NOT NULL;

-- 2. Optional metadata JSONB column for extra Notion-specific attributes.
ALTER TABLE public.knowledge_base
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Helpful index for filtering by file_type (used to identify Notion-origin rows).
CREATE INDEX IF NOT EXISTS knowledge_base_file_type_idx
  ON public.knowledge_base (file_type);
