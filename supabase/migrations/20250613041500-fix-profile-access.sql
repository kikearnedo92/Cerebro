
-- Create a safe function to get user profile without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(user_uid uuid)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  area text,
  rol_empresa text,
  role_system text,
  is_super_admin boolean,
  tenant_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Direct query without RLS checks for profile fetching
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.area,
    p.rol_empresa,
    p.role_system,
    p.is_super_admin,
    p.tenant_id,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = user_uid;
END;
$$;

-- Create function to get all tenants for super admin
CREATE OR REPLACE FUNCTION public.get_all_tenants_for_super_admin()
RETURNS TABLE (
  id uuid,
  name text,
  subdomain text,
  domain text,
  plan text,
  settings jsonb,
  branding jsonb,
  subscription_status text,
  trial_ends_at timestamptz,
  is_internal boolean,
  max_users integer,
  max_storage_gb integer,
  max_monthly_queries integer,
  areas text[],
  admin_email text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is super admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role_system = 'super_admin' OR is_super_admin = true)
  ) THEN
    RAISE EXCEPTION 'Access denied: Only super admins can view all tenants';
  END IF;

  -- Return all tenants
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.subdomain,
    t.domain,
    t.plan,
    t.settings,
    t.branding,
    t.subscription_status,
    t.trial_ends_at,
    t.is_internal,
    t.max_users,
    t.max_storage_gb,
    t.max_monthly_queries,
    t.areas,
    t.admin_email,
    t.created_at,
    t.updated_at
  FROM tenants t
  ORDER BY t.created_at DESC;
END;
$$;
