-- Fix knowledge_base unique constraint
--
-- The legacy index `knowledge_base_tenant_source_uniq` covered only (tenant_id, source),
-- which means only ONE row per integration per tenant could exist. That's wrong —
-- there should be one row per (tenant, source, external document id).
--
-- This migration:
--   1. Drops the legacy too-strict index
--   2. Creates a new unique index covering (tenant_id, source, metadata->>'external_id')
--   3. Partial WHERE makes it skip rows without external_id (e.g., manual uploads)

DROP INDEX IF EXISTS public.knowledge_base_tenant_source_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_base_tenant_source_external_uniq
  ON public.knowledge_base (tenant_id, source, ((metadata->>'external_id')))
  WHERE metadata->>'external_id' IS NOT NULL;

-- ROLLBACK (run manually if needed):
--   DROP INDEX IF EXISTS public.knowledge_base_tenant_source_external_uniq;
--   CREATE UNIQUE INDEX knowledge_base_tenant_source_uniq
--     ON public.knowledge_base USING btree (tenant_id, source);
