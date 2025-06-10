
-- Crear función para cambio de contexto de tenant
CREATE OR REPLACE FUNCTION public.switch_tenant_context(p_tenant_subdomain text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_tenant_id uuid;
  user_profile profiles%ROWTYPE;
BEGIN
  -- Verificar que el usuario está autenticado
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuario no autenticado'
    );
  END IF;

  -- Obtener el perfil del usuario actual
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = auth.uid();

  -- Verificar que es super admin
  IF NOT COALESCE(user_profile.is_super_admin, false) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No tienes permisos para cambiar de tenant'
    );
  END IF;

  -- Buscar el tenant objetivo
  SELECT id INTO target_tenant_id
  FROM tenants
  WHERE subdomain = p_tenant_subdomain;

  IF target_tenant_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Tenant no encontrado'
    );
  END IF;

  -- Actualizar el tenant_id del usuario
  UPDATE profiles
  SET tenant_id = target_tenant_id,
      updated_at = now()
  WHERE id = auth.uid();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Contexto de tenant cambiado exitosamente',
    'tenant_id', target_tenant_id
  );
END;
$$;

-- Crear política para que admins puedan gestionar su tenant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'admins_manage_tenant'
  ) THEN
    CREATE POLICY "admins_manage_tenant" ON public.tenants
      FOR UPDATE USING (
        id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role_system = 'admin')
      );
  END IF;
END $$;

-- Crear política para que super admins tengan acceso total
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' 
    AND policyname = 'super_admin_full_access_tenants'
  ) THEN
    CREATE POLICY "super_admin_full_access_tenants" ON public.tenants
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
      );
  END IF;
END $$;

-- Añadir tenant de desarrollo si no existe
INSERT INTO public.tenants (
  name, subdomain, plan, subscription_status, is_internal,
  max_users, max_storage_gb, max_monthly_queries, areas, admin_email
) VALUES (
  'Desarrollo', 'dev', 'internal', 'active', TRUE,
  -1, -1, -1,
  ARRAY['Development', 'Testing', 'QA'],
  'eduardo@retorna.app'
) ON CONFLICT (subdomain) DO NOTHING;

-- Añadir tenant de demo si no existe
INSERT INTO public.tenants (
  name, subdomain, plan, subscription_status, is_internal,
  max_users, max_storage_gb, max_monthly_queries, areas, admin_email
) VALUES (
  'Demo', 'demo', 'starter', 'trial', FALSE,
  10, 2, 500,
  ARRAY['Sales', 'Marketing', 'Demo'],
  'demo@retorna.app'
) ON CONFLICT (subdomain) DO NOTHING;
