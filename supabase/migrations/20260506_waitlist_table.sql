-- Waitlist table for landing page email capture
-- Public can INSERT (anonymous), only super_admin can SELECT (read all)

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

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can INSERT
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only super_admin can SELECT / UPDATE / DELETE
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
