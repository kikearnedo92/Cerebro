
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own_tenant" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "admins_manage_tenant" ON public.tenants
  FOR UPDATE USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role_system = 'admin')
  );

CREATE POLICY "super_admin_full_access_tenants" ON public.tenants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );
