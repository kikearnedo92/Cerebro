-- ============================================
-- CEREBRO — Fix RLS infinite recursion
-- The super-admin policies referenced profiles from within profiles, causing loops.
-- We replace them with SECURITY DEFINER helper functions that bypass RLS cleanly.
-- ============================================

-- 1. Helper: is_super_admin() — checks without triggering RLS
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = p_user_id),
    FALSE
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Helper: get_user_tenant() — returns the tenant_id of a user
CREATE OR REPLACE FUNCTION public.get_user_tenant(p_user_id UUID)
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = p_user_id
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Helper: is_tenant_admin() — checks if user is admin of a specific tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(p_user_id UUID, p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id
      AND tenant_id = p_tenant_id
      AND role_system IN ('admin', 'super_admin')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- 4. DROP the recursive policies
DROP POLICY IF EXISTS "Super admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Super admins update tenants" ON public.tenants;
DROP POLICY IF EXISTS "Super admins create tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenant members read own integrations" ON public.integrations;
DROP POLICY IF EXISTS "Tenant admins manage integrations" ON public.integrations;
DROP POLICY IF EXISTS "Tenant admins view invitations" ON public.tenant_invitations;
DROP POLICY IF EXISTS "Tenant admins create invitations" ON public.tenant_invitations;
DROP POLICY IF EXISTS "Tenant admins delete invitations" ON public.tenant_invitations;
DROP POLICY IF EXISTS "Tenant views own usage" ON public.usage_counters;


-- 5. Recreate policies using the SECURITY DEFINER helpers (no recursion)

-- PROFILES: users see their own, super_admins see all, tenant admins see same-tenant
CREATE POLICY "Profiles — self or super_admin or tenant_admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_super_admin(auth.uid())
    OR (
      tenant_id IS NOT NULL
      AND tenant_id = public.get_user_tenant(auth.uid())
      AND public.is_tenant_admin(auth.uid(), tenant_id)
    )
  );

-- TENANTS: members see their own, super_admins see all
CREATE POLICY "Tenants — member or super_admin" ON public.tenants
  FOR SELECT USING (
    public.is_super_admin(auth.uid())
    OR id = public.get_user_tenant(auth.uid())
  );

CREATE POLICY "Tenants — super_admin update" ON public.tenants
  FOR UPDATE USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Tenants — super_admin insert" ON public.tenants
  FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));

-- INTEGRATIONS: scoped by tenant_uuid
CREATE POLICY "Integrations — tenant members read" ON public.integrations
  FOR SELECT USING (
    public.is_super_admin(auth.uid())
    OR tenant_uuid = public.get_user_tenant(auth.uid())
  );

CREATE POLICY "Integrations — tenant admins manage" ON public.integrations
  FOR ALL USING (
    public.is_super_admin(auth.uid())
    OR (
      tenant_uuid = public.get_user_tenant(auth.uid())
      AND public.is_tenant_admin(auth.uid(), tenant_uuid)
    )
  );

-- TENANT INVITATIONS
CREATE POLICY "Invitations — view" ON public.tenant_invitations
  FOR SELECT USING (
    public.is_super_admin(auth.uid())
    OR tenant_id = public.get_user_tenant(auth.uid())
  );

CREATE POLICY "Invitations — create" ON public.tenant_invitations
  FOR INSERT WITH CHECK (
    public.is_super_admin(auth.uid())
    OR (
      tenant_id = public.get_user_tenant(auth.uid())
      AND public.is_tenant_admin(auth.uid(), tenant_id)
    )
  );

CREATE POLICY "Invitations — delete" ON public.tenant_invitations
  FOR DELETE USING (
    public.is_super_admin(auth.uid())
    OR (
      tenant_id = public.get_user_tenant(auth.uid())
      AND public.is_tenant_admin(auth.uid(), tenant_id)
    )
  );

-- USAGE COUNTERS
CREATE POLICY "Usage — tenant member view" ON public.usage_counters
  FOR SELECT USING (
    public.is_super_admin(auth.uid())
    OR tenant_id = public.get_user_tenant(auth.uid())
  );


-- 6. Backfill: make sure Kike has a tenant_id (in case the earlier backfill missed him)
DO $$
DECLARE
  r RECORD;
  v_tenant_id UUID;
BEGIN
  FOR r IN SELECT id, email FROM public.profiles WHERE tenant_id IS NULL LOOP
    INSERT INTO public.tenants (name, subdomain, admin_email, plan, is_internal)
    VALUES (
      COALESCE(split_part(r.email, '@', 1), 'tenant') || '-org',
      lower(regexp_replace(COALESCE(split_part(r.email, '@', 1), 'tenant') || '-' || substr(r.id::text, 1, 8), '[^a-z0-9-]', '', 'g')),
      r.email,
      'starter',
      FALSE
    )
    ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_tenant_id;

    UPDATE public.profiles SET tenant_id = v_tenant_id WHERE id = r.id;
  END LOOP;
END $$;

-- Make sure Kike is super_admin
UPDATE public.profiles
SET is_super_admin = TRUE, role_system = 'super_admin'
WHERE lower(email) = 'eduardoarnedog@gmail.com';

-- ============================================
-- END migration
-- ============================================
