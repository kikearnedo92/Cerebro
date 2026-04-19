-- ============================================
-- CEREBRO — Multi-tenant hardening + OAuth integrations
-- Migration 2026-04-19: tenant_invitations, usage_counters,
-- integrations OAuth columns, super-admin policies.
-- Safe to re-run (all IF NOT EXISTS).
-- ============================================

-- 1. TENANT INVITATIONS ---------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('tenant_admin', 'member')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant ON public.tenant_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON public.tenant_invitations(lower(email));
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_token ON public.tenant_invitations(token);

ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant admins view invitations" ON public.tenant_invitations;
CREATE POLICY "Tenant admins view invitations" ON public.tenant_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (profiles.is_super_admin = TRUE OR profiles.tenant_id = tenant_invitations.tenant_id)
    )
  );

DROP POLICY IF EXISTS "Tenant admins create invitations" ON public.tenant_invitations;
CREATE POLICY "Tenant admins create invitations" ON public.tenant_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND profiles.tenant_id = tenant_invitations.tenant_id
        AND (profiles.is_super_admin = TRUE OR profiles.role_system IN ('admin', 'super_admin'))
    )
  );

DROP POLICY IF EXISTS "Tenant admins delete invitations" ON public.tenant_invitations;
CREATE POLICY "Tenant admins delete invitations" ON public.tenant_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (profiles.is_super_admin = TRUE OR (
          profiles.tenant_id = tenant_invitations.tenant_id
          AND profiles.role_system IN ('admin', 'super_admin')
        ))
    )
  );


-- 2. USAGE COUNTERS -------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_counters (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  queries_count INT NOT NULL DEFAULT 0,
  docs_count INT NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, period_start)
);

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant views own usage" ON public.usage_counters;
CREATE POLICY "Tenant views own usage" ON public.usage_counters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (profiles.is_super_admin = TRUE OR profiles.tenant_id = usage_counters.tenant_id)
    )
  );


-- 3. INTEGRATIONS — add OAuth + sync columns ------------
-- Existing table `integrations` has tenant_id TEXT; we add OAuth columns.
-- We also add a typed tenant_uuid for joins (kept nullable for backfill).

ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS tenant_uuid UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

ALTER TABLE public.integrations
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS oauth_state TEXT,
  ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
  ADD COLUMN IF NOT EXISTS items_synced INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Backfill tenant_uuid from tenant_id TEXT where it's a valid UUID
UPDATE public.integrations
SET tenant_uuid = tenant_id::uuid
WHERE tenant_uuid IS NULL
  AND tenant_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

CREATE INDEX IF NOT EXISTS idx_integrations_tenant_uuid ON public.integrations(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(integration_id);

-- FIX weak RLS on integrations (was: TO authenticated USING (true))
DROP POLICY IF EXISTS "Authenticated users can manage integrations" ON public.integrations;

DROP POLICY IF EXISTS "Tenant members read own integrations" ON public.integrations;
CREATE POLICY "Tenant members read own integrations" ON public.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (profiles.is_super_admin = TRUE OR profiles.tenant_id = integrations.tenant_uuid)
    )
  );

DROP POLICY IF EXISTS "Tenant admins manage integrations" ON public.integrations;
CREATE POLICY "Tenant admins manage integrations" ON public.integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND (profiles.is_super_admin = TRUE OR (
          profiles.tenant_id = integrations.tenant_uuid
          AND profiles.role_system IN ('admin', 'super_admin')
        ))
    )
  );


-- 4. TENANTS — stripe columns (deferred but schema ready)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON public.tenants(stripe_customer_id);


-- 5. SUPER-ADMIN policies for cross-tenant visibility ---
DROP POLICY IF EXISTS "Super admins view all tenants" ON public.tenants;
CREATE POLICY "Super admins view all tenants" ON public.tenants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tenant_id = tenants.id)
  );

DROP POLICY IF EXISTS "Super admins update tenants" ON public.tenants;
CREATE POLICY "Super admins update tenants" ON public.tenants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

DROP POLICY IF EXISTS "Super admins create tenants" ON public.tenants;
CREATE POLICY "Super admins create tenants" ON public.tenants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

DROP POLICY IF EXISTS "Super admins view all profiles" ON public.profiles;
CREATE POLICY "Super admins view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.is_super_admin = TRUE)
    OR EXISTS (
      SELECT 1 FROM public.profiles p3
      WHERE p3.id = auth.uid()
        AND p3.tenant_id = profiles.tenant_id
        AND p3.role_system IN ('admin', 'super_admin')
    )
  );


-- 6. HELPER: accept invitation on signup ---------------
-- Modifies handle_new_user to pick up tenant from invitation token if provided.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_role TEXT := 'user';
  v_invitation_token TEXT;
BEGIN
  -- Extract invitation token from user metadata (set by frontend at signup)
  v_invitation_token := NEW.raw_user_meta_data->>'invitation_token';

  IF v_invitation_token IS NOT NULL THEN
    SELECT tenant_id, role INTO v_tenant_id, v_role
    FROM public.tenant_invitations
    WHERE token = v_invitation_token
      AND accepted_at IS NULL
      AND expires_at > now()
    LIMIT 1;

    IF v_tenant_id IS NOT NULL THEN
      UPDATE public.tenant_invitations
      SET accepted_at = now()
      WHERE token = v_invitation_token;
    END IF;
  END IF;

  -- If no invitation, create a new tenant for the signing-up user (self-serve)
  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (name, subdomain, admin_email, plan)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', split_part(NEW.email, '@', 1) || '-org'),
      lower(regexp_replace(split_part(NEW.email, '@', 1) || '-' || substr(NEW.id::text, 1, 8), '[^a-z0-9-]', '', 'g')),
      NEW.email,
      'starter'
    )
    RETURNING id INTO v_tenant_id;

    v_role := 'admin'; -- First user of a new tenant is its admin
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role_system, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN v_role = 'tenant_admin' THEN 'admin' ELSE v_role END,
    v_tenant_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. HELPER: increment usage counter ------------------
CREATE OR REPLACE FUNCTION public.increment_queries(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage_counters (tenant_id, period_start, queries_count)
  VALUES (p_tenant_id, date_trunc('month', now())::date, 1)
  ON CONFLICT (tenant_id, period_start)
  DO UPDATE SET queries_count = usage_counters.queries_count + 1,
                updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. HELPER: check tenant over limit ------------------
CREATE OR REPLACE FUNCTION public.tenant_over_query_limit(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_used INT;
  v_limit INT;
BEGIN
  SELECT queries_count INTO v_used
  FROM public.usage_counters
  WHERE tenant_id = p_tenant_id
    AND period_start = date_trunc('month', now())::date;

  SELECT max_monthly_queries INTO v_limit
  FROM public.tenants WHERE id = p_tenant_id;

  RETURN COALESCE(v_used, 0) >= COALESCE(v_limit, 1000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- END migration
-- ============================================
