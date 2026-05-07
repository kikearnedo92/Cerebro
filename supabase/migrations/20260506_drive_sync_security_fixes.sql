-- =====================================================================
-- Code Reviewer feedback fixes for Sprint 3 background queue
--
-- Issues addressed:
--   #2 Corrupción silenciosa al re-sync: upsert pone status='pending' siempre,
--      reseteando archivos ya done si el usuario hace clic en "Sincronizar"
--      mientras el worker procesa. Fix: condicionado a modified_time changed.
--   #4 claim_drive_sync_jobs sin LIMIT máximo (DoS potencial)
--   #6 IDOR en drive_sync_stats — acepta cualquier tenant_id sin validar
--      que el caller pertenezca al tenant.
-- =====================================================================

-- =====================================================================
-- Fix #6: drive_sync_stats — validate caller belongs to tenant
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the caller is in the requested tenant.
  -- service_role bypasses RLS but auth.uid() returns NULL for it,
  -- so we explicitly allow service_role through.
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
    COUNT(*) FILTER (WHERE status = 'pending')                 AS pending,
    COUNT(*) FILTER (WHERE status = 'processing')              AS processing,
    COUNT(*) FILTER (WHERE status = 'done')                    AS done,
    COUNT(*) FILTER (WHERE status = 'error')                   AS error,
    COUNT(*) FILTER (WHERE status = 'skipped')                 AS skipped,
    COUNT(*)                                                   AS total,
    MIN(created_at) FILTER (WHERE status = 'pending')          AS oldest_pending_at
  FROM public.drive_sync_queue
  WHERE tenant_id = p_tenant_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.drive_sync_stats(uuid) TO authenticated;

-- =====================================================================
-- Fix #4: claim_drive_sync_jobs — clamp p_limit to safe range
-- =====================================================================
CREATE OR REPLACE FUNCTION public.claim_drive_sync_jobs(p_limit int DEFAULT 5)
RETURNS SETOF public.drive_sync_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_limit int := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 50);
BEGIN
  RETURN QUERY
  WITH next_jobs AS (
    SELECT id
    FROM public.drive_sync_queue
    WHERE status = 'pending'
    ORDER BY created_at
    LIMIT safe_limit
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

-- =====================================================================
-- Fix #2: enqueue_drive_files RPC
--
-- Replaces the client-side upsert in google-drive-integration. The RPC
-- only resets status='pending' when modified_time CHANGES, preserving
-- already-done rows.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.enqueue_drive_files(
  p_tenant_id uuid,
  p_user_id uuid,
  p_files jsonb
)
RETURNS TABLE (enqueued bigint, total bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted bigint := 0;
  v_total bigint := jsonb_array_length(p_files);
BEGIN
  -- Validate caller belongs to tenant (or is service_role / no auth.uid)
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tenant_id = p_tenant_id
    ) THEN
      RAISE EXCEPTION 'Access denied: not a member of tenant %', p_tenant_id
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Insert new files; on conflict only reset to 'pending' if modified_time
  -- actually changed. This preserves done/processing rows when user clicks
  -- "Sincronizar" repeatedly.
  WITH input AS (
    SELECT
      (f->>'file_id')::text                  AS file_id,
      (f->>'file_name')::text                AS file_name,
      (f->>'file_mime')::text                AS file_mime,
      NULLIF(f->>'file_size', '')::bigint    AS file_size,
      (f->>'modified_time')::timestamptz     AS modified_time,
      (f->>'web_view_link')::text            AS web_view_link
    FROM jsonb_array_elements(p_files) AS f
  ),
  upserted AS (
    INSERT INTO public.drive_sync_queue (
      tenant_id, user_id, file_id, file_name, file_mime, file_size,
      modified_time, web_view_link, status, attempts, error_message
    )
    SELECT
      p_tenant_id, p_user_id, file_id, file_name, file_mime, file_size,
      modified_time, web_view_link, 'pending', 0, NULL
    FROM input
    ON CONFLICT (tenant_id, file_id) DO UPDATE SET
      -- only reset to pending if file was actually modified
      status = CASE
        WHEN drive_sync_queue.modified_time IS DISTINCT FROM EXCLUDED.modified_time
          THEN 'pending'
        ELSE drive_sync_queue.status
      END,
      attempts = CASE
        WHEN drive_sync_queue.modified_time IS DISTINCT FROM EXCLUDED.modified_time
          THEN 0
        ELSE drive_sync_queue.attempts
      END,
      error_message = CASE
        WHEN drive_sync_queue.modified_time IS DISTINCT FROM EXCLUDED.modified_time
          THEN NULL
        ELSE drive_sync_queue.error_message
      END,
      file_name = EXCLUDED.file_name,
      file_mime = EXCLUDED.file_mime,
      file_size = EXCLUDED.file_size,
      modified_time = EXCLUDED.modified_time,
      web_view_link = EXCLUDED.web_view_link
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_inserted FROM upserted;

  RETURN QUERY SELECT v_inserted, v_total;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enqueue_drive_files(uuid, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_drive_files(uuid, uuid, jsonb) TO authenticated;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.enqueue_drive_files(uuid, uuid, jsonb);
--   -- restore previous claim_drive_sync_jobs and drive_sync_stats from
--   -- 20260506_drive_sync_queue.sql if needed
