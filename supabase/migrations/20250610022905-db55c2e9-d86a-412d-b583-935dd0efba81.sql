
-- 1. Eliminar el constraint de dominio de email existente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS email_domain_check;

-- 2. Crear nuevo constraint que permita @retorna.app y eduardoarnedog@gmail.com
ALTER TABLE public.profiles ADD CONSTRAINT email_domain_check 
CHECK (
  email LIKE '%@retorna.app' OR 
  email = 'eduardoarnedog@gmail.com'
);

-- 3. Eliminar constraint de rol del sistema existente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_system_check;

-- 4. Crear nuevo constraint que incluya super_admin
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_system_check 
CHECK (role_system IN ('user', 'admin', 'super_admin'));

-- 5. Actualizar constraint de áreas para incluir todas las áreas necesarias
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_area_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_area_check 
CHECK (area IN (
  'Customer Success', 'Tesorería', 'Compliance', 'Growth', 
  'Producto', 'Operaciones', 'People', 'Administración', 
  'ATC', 'Research', 'Onboarding', 'Data', 'Management', 
  'Otro', 'General', 'Otros'
));

-- 6. Actualizar la función handle_new_user para manejar super_admin correctamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, area, rol_empresa, role_system, is_super_admin, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'area', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'rol_empresa', 'Usuario'),
    CASE 
      WHEN NEW.email = 'eduardoarnedog@gmail.com' THEN 'super_admin'
      WHEN NEW.email = 'eduardo@retorna.app' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role_system', 'user')
    END,
    CASE 
      WHEN NEW.email = 'eduardoarnedog@gmail.com' THEN TRUE
      ELSE FALSE
    END,
    (SELECT id FROM public.tenants WHERE subdomain = 'retorna' LIMIT 1)
  );
  RETURN NEW;
END;
$$;
