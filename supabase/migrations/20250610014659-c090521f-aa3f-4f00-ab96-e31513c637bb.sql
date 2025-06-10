
-- PASO 1: Crear tabla de tenants primero
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  domain TEXT, -- custom domain opcional
  plan TEXT DEFAULT 'starter', -- internal, starter, pro, enterprise
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}', -- logo, colores personalizados
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  is_internal BOOLEAN DEFAULT FALSE, -- TRUE para Retorna
  max_users INTEGER DEFAULT 25,
  max_storage_gb INTEGER DEFAULT 5,
  max_monthly_queries INTEGER DEFAULT 1000,
  areas TEXT[] DEFAULT ARRAY['General'], -- áreas personalizables por tenant
  admin_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: Insertar Retorna como tenant interno
INSERT INTO public.tenants (
  name, subdomain, plan, subscription_status, is_internal,
  max_users, max_storage_gb, max_monthly_queries, areas, admin_email
) VALUES (
  'Retorna', 'retorna', 'internal', 'active', TRUE,
  -1, -1, -1,  -- -1 = unlimited
  ARRAY['Customer Success', 'Tesorería', 'Compliance', 'Growth', 'Producto', 'Operaciones', 'People', 'Administración', 'Otros'],
  'eduardo@retorna.app'
) ON CONFLICT (subdomain) DO NOTHING;

-- PASO 3: Agregar columnas a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- PASO 4: Actualizar datos existentes al tenant de Retorna
UPDATE public.profiles SET tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'retorna') WHERE tenant_id IS NULL;
