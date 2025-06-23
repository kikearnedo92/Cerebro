
-- Create feature flags table
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant feature flags table
CREATE TABLE public.tenant_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_flag_id)
);

-- Create user feature permissions table
CREATE TABLE public.user_feature_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_flag_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feature_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags (only super admins can manage)
CREATE POLICY "Super admins can manage feature flags" 
  ON public.feature_flags 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_super_admin = true OR email = 'eduardo@retorna.app')
    )
  );

-- RLS Policies for tenant_feature_flags
CREATE POLICY "Super admins can manage tenant feature flags" 
  ON public.tenant_feature_flags 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_super_admin = true OR email = 'eduardo@retorna.app')
    )
  );

-- RLS Policies for user_feature_permissions
CREATE POLICY "Super admins can manage user permissions" 
  ON public.user_feature_permissions 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_super_admin = true OR email = 'eduardo@retorna.app')
    )
  );

CREATE POLICY "Users can view their own permissions" 
  ON public.user_feature_permissions 
  FOR SELECT
  USING (user_id = auth.uid());

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, is_global) VALUES
('chat_ai', 'AI Chat Assistant', false),
('insights', 'Cerebro Insights Analytics', false),
('autodev', 'AutoDev Code Generation', false),
('advanced_analytics', 'Advanced Analytics Dashboard', false),
('competitive_intelligence', 'Real-time Competitive Analysis', false),
('predictive_modeling', 'Predictive Analytics Engine', false),
('multi_platform_generation', 'Multi-platform Code Generation', false),
('regulatory_compliance', 'Regulatory Compliance Tools', false);

-- Create function to check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature_access(
  _user_id UUID,
  _feature_name VARCHAR,
  _tenant_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  feature_id UUID;
  tenant_enabled BOOLEAN := false;
  user_enabled BOOLEAN := false;
  is_super_admin_user BOOLEAN := false;
BEGIN
  -- Check if user is super admin (always has access)
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id 
    AND (is_super_admin = true OR email = 'eduardo@retorna.app')
  ) INTO is_super_admin_user;
  
  IF is_super_admin_user THEN
    RETURN true;
  END IF;

  -- Get feature flag id
  SELECT id INTO feature_id 
  FROM public.feature_flags 
  WHERE name = _feature_name;
  
  IF feature_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if feature is enabled for tenant
  IF _tenant_id IS NOT NULL THEN
    SELECT COALESCE(tff.is_enabled, false) INTO tenant_enabled
    FROM public.tenant_feature_flags tff
    WHERE tff.tenant_id = _tenant_id 
    AND tff.feature_flag_id = feature_id;
  ELSE
    tenant_enabled := true; -- No tenant restriction
  END IF;

  -- Check if user has specific permission
  SELECT COALESCE(ufp.is_enabled, false) INTO user_enabled
  FROM public.user_feature_permissions ufp
  WHERE ufp.user_id = _user_id 
  AND ufp.feature_flag_id = feature_id
  AND (_tenant_id IS NULL OR ufp.tenant_id = _tenant_id);

  -- Return true if both tenant and user have access
  RETURN tenant_enabled AND user_enabled;
END;
$$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tenant_feature_flags_updated_at BEFORE UPDATE ON public.tenant_feature_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_feature_permissions_updated_at BEFORE UPDATE ON public.user_feature_permissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
