-- Background queue for Drive sync
-- Allows processing files asynchronously via a worker (cron job)
-- so the user clicks "Sincronizar" once and gets a progress bar
-- instead of having to click 17 times.

CREATE TABLE IF NOT EXISTS public.drive_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  file_id text NOT NULL,
  file_name text,
  file_mime text,
  file_size bigint,
  modified_time timestamptz,
  web_view_link text,
  status text NOT NULL DEFAULT 'pending', -- pending | processing | done | error | skipped
  error_message text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  UNIQUE(tenant_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_drive_sync_queue_tenant_status
  ON public.drive_sync_queue(tenant_id, status);

-- Worker picks up oldest pending across all tenants
CREATE INDEX IF NOT EXISTS idx_drive_sync_queue_pending
  ON public.drive_sync_queue(created_at)
  WHERE status = 'pending';

-- Auto-clean done rows older than 7 days (saves space, keeps recent for debugging)
-- Run via daily cron or manually:
--   DELETE FROM public.drive_sync_queue WHERE status = 'done' AND finished_at < now() - interval '7 days';

ALTER TABLE public.drive_sync_queue ENABLE ROW LEVEL SECURITY;

-- Tenant members can read their own queue (for progress UI)
DROP POLICY IF EXISTS "Tenant members read own queue" ON public.drive_sync_queue;
CREATE POLICY "Tenant members read own queue"
  ON public.drive_sync_queue
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Service role bypasses RLS — workers + enqueue use service role.
-- No INSERT/UPDATE policies for authenticated users — only service role writes.

-- =====================================================================
-- Helper: get sync stats for a tenant in 1 query
-- Used by the frontend for the progress bar.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.drive_sync_stats(p_tenant_id uuid)
RETURNS TABLE (
  pending bigint,
  processing bigint,
  done bigint,
  error bigint,
  skipped bigint,
  total bigint,
  oldest_pending_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending')                 AS pending,
    COUNT(*) FILTER (WHERE status = 'processing')              AS processing,
    COUNT(*) FILTER (WHERE status = 'done')                    AS done,
    COUNT(*) FILTER (WHERE status = 'error')                   AS error,
    COUNT(*) FILTER (WHERE status = 'skipped')                 AS skipped,
    COUNT(*)                                                   AS total,
    MIN(created_at) FILTER (WHERE status = 'pending')          AS oldest_pending_at
  FROM public.drive_sync_queue
  WHERE tenant_id = p_tenant_id;
$$;

GRANT EXECUTE ON FUNCTION public.drive_sync_stats(uuid) TO authenticated;

-- =====================================================================
-- Atomic job claim — used by drive-sync-worker
-- Selects oldest N pending rows, marks them as 'processing', returns them.
-- FOR UPDATE SKIP LOCKED prevents two workers from claiming same row.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.claim_drive_sync_jobs(p_limit int DEFAULT 5)
RETURNS SETOF public.drive_sync_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH next_jobs AS (
    SELECT id
    FROM public.drive_sync_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.drive_sync_queue q
  SET status = 'processing',
      started_at = now()
  FROM next_jobs
  WHERE q.id = next_jobs.id
  RETURNING q.*;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_drive_sync_jobs(int) FROM PUBLIC;
-- service_role bypasses, no GRANT needed for it

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.drive_sync_stats(uuid);
--   DROP TABLE IF EXISTS public.drive_sync_queue;
