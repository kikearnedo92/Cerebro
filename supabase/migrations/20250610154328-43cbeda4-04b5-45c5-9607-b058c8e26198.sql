
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

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.switch_tenant_context(text) TO authenticated;
