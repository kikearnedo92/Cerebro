-- Waitlist table for landing page email capture
-- Public can INSERT (anonymous), only super_admin can SELECT (read all)
-- Hard DELETE intentionally disabled — use status='rejected' for soft-delete (see policies below)

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  company_name text,
  company_size text,
  use_case text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip_address text,
  user_agent text,
  status text NOT NULL DEFAULT 'pending', -- pending | invited | onboarded | rejected
  notes text,
  invited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_company_size ON public.waitlist(company_size);
CREATE INDEX IF NOT EXISTS idx_waitlist_ip_recent ON public.waitlist(ip_address, created_at DESC)
  WHERE ip_address IS NOT NULL;

-- =====================================================================
-- Server-side IP + User-Agent capture (no edge function needed)
-- PostgREST exposes incoming headers via current_setting('request.headers')
-- This trigger fires BEFORE INSERT and populates ip_address + user_agent
-- so the client never has to send them (and can't spoof them).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.capture_waitlist_request_meta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  headers json;
BEGIN
  -- request.headers is set by PostgREST as a JSON object of incoming headers
  headers := nullif(current_setting('request.headers', true), '')::json;

  IF headers IS NOT NULL THEN
    -- x-forwarded-for can be "client, proxy1, proxy2" — take first non-empty entry
    NEW.ip_address := coalesce(
      NEW.ip_address,
      split_part(headers->>'x-forwarded-for', ',', 1),
      headers->>'cf-connecting-ip',
      headers->>'x-real-ip'
    );
    NEW.user_agent := coalesce(NEW.user_agent, headers->>'user-agent');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS waitlist_capture_meta ON public.waitlist;
CREATE TRIGGER waitlist_capture_meta
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.capture_waitlist_request_meta();

-- =====================================================================
-- Rate limiting: max 5 inserts per IP per hour
-- Mitigates spam + email enumeration via 23505 oracle
-- =====================================================================
CREATE OR REPLACE FUNCTION public.enforce_waitlist_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip rate limiting when there's no IP (e.g., direct service-role inserts)
  IF NEW.ip_address IS NULL THEN
    RETURN NEW;
  END IF;

  IF (
    SELECT COUNT(*) FROM public.waitlist
    WHERE ip_address = NEW.ip_address
      AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = 'P0001', HINT = 'Max 5 waitlist signups per IP per hour';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS waitlist_rate_limit ON public.waitlist;
CREATE TRIGGER waitlist_rate_limit
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.enforce_waitlist_rate_limit();

-- =====================================================================
-- RLS policies
-- =====================================================================
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can INSERT — trigger captures IP for rate-limit
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only super_admin can SELECT
DROP POLICY IF EXISTS "Super admin can read waitlist" ON public.waitlist;
CREATE POLICY "Super admin can read waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- Only super_admin can UPDATE (e.g., status='invited' or status='rejected')
DROP POLICY IF EXISTS "Super admin can update waitlist" ON public.waitlist;
CREATE POLICY "Super admin can update waitlist"
  ON public.waitlist
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- NOTE: Hard DELETE is intentionally disabled. Use status='rejected' for soft-delete.
-- Audit trail and email enumeration resistance both benefit from keeping rows.

-- =====================================================================
-- ROLLBACK (run manually if needed):
--   DROP TRIGGER IF EXISTS waitlist_rate_limit ON public.waitlist;
--   DROP TRIGGER IF EXISTS waitlist_capture_meta ON public.waitlist;
--   DROP FUNCTION IF EXISTS public.enforce_waitlist_rate_limit();
--   DROP FUNCTION IF EXISTS public.capture_waitlist_request_meta();
--   DROP TABLE IF EXISTS public.waitlist;
-- =====================================================================
