
-- Crear bucket de storage para archivos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('retorna-files', 'retorna-files', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas conflictivas existentes en storage.objects
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;

-- Crear políticas de storage para super admins y admins
CREATE POLICY "Super admins and admins can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role_system IN ('admin', 'super_admin') OR profiles.is_super_admin = TRUE)
  )
);

CREATE POLICY "Super admins and admins can view files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role_system IN ('admin', 'super_admin') OR profiles.is_super_admin = TRUE)
  )
);

CREATE POLICY "Super admins and admins can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'retorna-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role_system IN ('admin', 'super_admin') OR profiles.is_super_admin = TRUE)
  )
);

CREATE POLICY "All authenticated users can view public files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'retorna-files' AND
  auth.uid() IS NOT NULL
);

-- Crear políticas RLS para knowledge_base que permitan acceso a super admins
DROP POLICY IF EXISTS "Super admin full access knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Admins can manage knowledge base" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can view active knowledge base" ON public.knowledge_base;

-- Habilitar RLS en knowledge_base si no está habilitado
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Política para super admins - acceso completo
CREATE POLICY "Super admin full access knowledge base" ON public.knowledge_base
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (is_super_admin = TRUE OR role_system = 'super_admin')
  )
);

-- Política para admins - acceso completo a su tenant
CREATE POLICY "Admins can manage knowledge base" ON public.knowledge_base
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role_system IN ('admin', 'super_admin')
  )
);

-- Política para usuarios - solo ver contenido activo
CREATE POLICY "Users can view active knowledge base" ON public.knowledge_base
FOR SELECT USING (
  active = true AND
  auth.uid() IS NOT NULL
);

-- Crear función para verificar si usuario es super admin (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Actualizar políticas de tenants para super admins
DROP POLICY IF EXISTS "super_admin_full_access_tenants" ON public.tenants;

CREATE POLICY "super_admin_full_access_tenants" ON public.tenants
FOR ALL USING (public.is_super_admin_user());
