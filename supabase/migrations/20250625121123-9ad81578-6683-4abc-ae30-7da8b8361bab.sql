
-- Create products table for Cerebro vs Núcleo configuration
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'cerebro' or 'nucleo'
  display_name TEXT NOT NULL, -- 'Cerebro' or 'Núcleo'
  description TEXT,
  features TEXT[] DEFAULT '{}', -- Array of enabled feature flags
  branding JSONB DEFAULT '{}', -- Branding configuration
  is_commercial BOOLEAN DEFAULT false, -- true for Núcleo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default products
INSERT INTO public.products (name, display_name, description, features, is_commercial) VALUES 
('cerebro', 'Cerebro', 'Internal enterprise AI assistant', 
 ARRAY['memory_chat', 'memory_knowledge', 'insights_analytics', 'admin_users', 'admin_analytics'], 
 false),
('nucleo', 'Núcleo', 'Commercial AI suite for founders', 
 ARRAY['memory_chat', 'memory_knowledge', 'insights_analytics', 'launch_voice', 'build_code', 'admin_users', 'admin_analytics', 'admin_tenants'], 
 true)
ON CONFLICT (name) DO NOTHING;

-- Add product_id to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);

-- Update existing tenants to use Cerebro by default
UPDATE public.tenants 
SET product_id = (SELECT id FROM public.products WHERE name = 'cerebro')
WHERE product_id IS NULL;

-- Enhanced feature flags table for granular control
CREATE TABLE IF NOT EXISTS public.feature_flags_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL, -- 'memory', 'insights', 'launch', 'build', 'admin'
  is_global BOOLEAN DEFAULT false,
  requires_commercial BOOLEAN DEFAULT false, -- true for Launch and Build features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert granular feature flags
INSERT INTO public.feature_flags_enhanced (name, display_name, description, module, requires_commercial) VALUES 
('memory_chat', 'AI Chat', 'Chat interface with AI assistant', 'memory', false),
('memory_knowledge', 'Knowledge Base', 'Document management and search', 'memory', false),
('insights_analytics', 'Analytics Dashboard', 'User behavior insights and analytics', 'insights', false),
('launch_voice', 'Voice Strategy', 'Voice onboarding and strategy generation', 'launch', true),
('build_code', 'Code Generation', 'Automated code generation and implementation', 'build', true),
('admin_users', 'User Management', 'Manage users and permissions', 'admin', false),
('admin_analytics', 'Admin Analytics', 'Administrative analytics and reports', 'admin', false),
('admin_tenants', 'Tenant Management', 'Super admin tenant management', 'admin', false)
ON CONFLICT (name) DO NOTHING;

-- Enhanced tenant feature flags with product constraints
CREATE TABLE IF NOT EXISTS public.tenant_feature_flags_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  feature_flag_id UUID REFERENCES public.feature_flags_enhanced(id) NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, feature_flag_id)
);

-- Function to automatically enable features based on product
CREATE OR REPLACE FUNCTION enable_default_product_features()
RETURNS TRIGGER AS $$
BEGIN
  -- When a tenant gets a product assigned, enable default features
  IF NEW.product_id IS NOT NULL AND (OLD.product_id IS NULL OR OLD.product_id != NEW.product_id) THEN
    -- Get product features and enable them
    INSERT INTO public.tenant_feature_flags_enhanced (tenant_id, feature_flag_id, is_enabled)
    SELECT 
      NEW.id,
      ff.id,
      true
    FROM public.products p
    CROSS JOIN public.feature_flags_enhanced ff
    WHERE p.id = NEW.product_id
    AND ff.name = ANY(p.features)
    ON CONFLICT (tenant_id, feature_flag_id) 
    DO UPDATE SET is_enabled = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic feature enablement
DROP TRIGGER IF EXISTS trigger_enable_product_features ON public.tenants;
CREATE TRIGGER trigger_enable_product_features
  AFTER UPDATE OF product_id ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION enable_default_product_features();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_feature_flags_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (readable by all authenticated users)
CREATE POLICY "products_readable_by_authenticated" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for enhanced feature flags (readable by all authenticated users)
CREATE POLICY "feature_flags_enhanced_readable" ON public.feature_flags_enhanced
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for tenant feature flags (users see their tenant's flags)
CREATE POLICY "tenant_feature_flags_enhanced_select" ON public.tenant_feature_flags_enhanced
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

-- Super admin policies for management
CREATE POLICY "super_admin_manage_products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

CREATE POLICY "super_admin_manage_feature_flags" ON public.feature_flags_enhanced
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );

CREATE POLICY "super_admin_manage_tenant_flags" ON public.tenant_feature_flags_enhanced
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = TRUE)
  );
