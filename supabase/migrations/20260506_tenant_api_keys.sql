-- Tenant API keys for MCP server access
-- Allows external agents (Claude, ChatGPT, n8n, Make, Zapier via MCP) to query Cerebro context

CREATE TABLE IF NOT EXISTS public.tenant_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,           -- first 8 chars (cb_live_) for display
  key_hash text NOT NULL UNIQUE,      -- bcrypt/sha256 hash of full key
  scopes text[] NOT NULL DEFAULT ARRAY['query_context', 'list_sources']::text[],
  rate_limit_per_minute int NOT NULL DEFAULT 60,
  created_by uuid REFERENCES auth.users(id),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant ON public.tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_hash ON public.tenant_api_keys(key_hash) WHERE revoked_at IS NULL;

-- API key usage log (for billing + rate limiting)
CREATE TABLE IF NOT EXISTS public.api_key_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.tenant_api_keys(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,
  tool_name text NOT NULL,
  query_text text,
  results_count int,
  latency_ms int,
  status text NOT NULL DEFAULT 'success', -- success | error | rate_limited
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_key ON public.api_key_usage(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_tenant_day ON public.api_key_usage(tenant_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage ENABLE ROW LEVEL SECURITY;

-- Tenant admins can manage their own API keys
DROP POLICY IF EXISTS "Tenant members can read own keys" ON public.tenant_api_keys;
CREATE POLICY "Tenant members can read own keys"
  ON public.tenant_api_keys
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenant admins can create keys" ON public.tenant_api_keys;
CREATE POLICY "Tenant admins can create keys"
  ON public.tenant_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Tenant admins can revoke keys" ON public.tenant_api_keys;
CREATE POLICY "Tenant admins can revoke keys"
  ON public.tenant_api_keys
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Tenant members can read usage of their tenant's keys
DROP POLICY IF EXISTS "Tenant members can read usage" ON public.api_key_usage;
CREATE POLICY "Tenant members can read usage"
  ON public.api_key_usage
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );
