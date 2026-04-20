-- Day 2 fix: PostgREST's upsert (ON CONFLICT via Prefer: resolution=merge-duplicates
-- or supabase-js upsert onConflict) requires the target index to NOT be partial.
-- The day-1 partial index with `WHERE source IS NOT NULL` was rejected by the planner
-- with "there is no unique or exclusion constraint matching the ON CONFLICT specification",
-- so Notion sync produced 23 errors and 0 inserts on first real run.
--
-- Replace with a non-partial unique index. PostgreSQL considers each NULL distinct in
-- UNIQUE, so manual uploads with source=NULL still insert without collision.

DROP INDEX IF EXISTS public.knowledge_base_tenant_source_uniq;

CREATE UNIQUE INDEX IF NOT EXISTS knowledge_base_tenant_source_uniq
  ON public.knowledge_base (tenant_id, source);
