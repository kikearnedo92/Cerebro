-- Recover drive_sync_queue rows stuck in 'processing' >10 minutes.
-- Worker may crash mid-processing; this self-heals on next claim.

CREATE OR REPLACE FUNCTION public.recover_stuck_drive_jobs()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected int;
BEGIN
  WITH updated AS (
    UPDATE public.drive_sync_queue
    SET status = 'pending',
        started_at = NULL,
        attempts = attempts + 1
    WHERE status = 'processing'
      AND started_at < now() - interval '10 minutes'
      AND attempts < 3
    RETURNING 1
  )
  SELECT COUNT(*) INTO affected FROM updated;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recover_stuck_drive_jobs() FROM PUBLIC;

-- Modify claim_drive_sync_jobs to call recover first
CREATE OR REPLACE FUNCTION public.claim_drive_sync_jobs(p_limit int DEFAULT 5)
RETURNS SETOF public.drive_sync_queue
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_limit int := LEAST(GREATEST(COALESCE(p_limit, 5), 1), 50);
BEGIN
  -- Self-heal stuck jobs first (free since it's a small UPDATE)
  PERFORM public.recover_stuck_drive_jobs();

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
