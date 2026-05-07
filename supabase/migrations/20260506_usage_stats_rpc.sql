-- =====================================================================
-- Usage stats RPCs for the admin dashboard
-- =====================================================================

-- Knowledge base stats per tenant
CREATE OR REPLACE FUNCTION public.tenant_kb_stats(p_tenant_id uuid)
RETURNS TABLE (
  total_docs bigint,
  embedded_docs bigint,
  by_source jsonb,
  recent_24h bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tenant_id = p_tenant_id) THEN
      RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)                                                              AS total_docs,
    COUNT(*) FILTER (WHERE embedding IS NOT NULL)                         AS embedded_docs,
    COALESCE(
      jsonb_object_agg(source, src_count) FILTER (WHERE source IS NOT NULL),
      '{}'::jsonb
    )                                                                     AS by_source,
    COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours')      AS recent_24h
  FROM (
    SELECT source, COUNT(*) OVER (PARTITION BY source) AS src_count, embedding, created_at
    FROM public.knowledge_base
    WHERE tenant_id = p_tenant_id AND active = true
  ) sub;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tenant_kb_stats(uuid) TO authenticated;

-- API key usage stats (for tenant)
CREATE OR REPLACE FUNCTION public.tenant_api_usage_stats(p_tenant_id uuid)
RETURNS TABLE (
  total_calls bigint,
  calls_24h bigint,
  calls_7d bigint,
  by_tool jsonb,
  by_status jsonb,
  avg_latency_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tenant_id = p_tenant_id) THEN
      RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)                                                              AS total_calls,
    COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours')      AS calls_24h,
    COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')        AS calls_7d,
    COALESCE(
      jsonb_object_agg(tool_name, tool_count) FILTER (WHERE tool_name IS NOT NULL),
      '{}'::jsonb
    )                                                                     AS by_tool,
    COALESCE(
      jsonb_object_agg(status, status_count) FILTER (WHERE status IS NOT NULL),
      '{}'::jsonb
    )                                                                     AS by_status,
    AVG(latency_ms)::numeric                                              AS avg_latency_ms
  FROM (
    SELECT
      tool_name,
      status,
      latency_ms,
      created_at,
      COUNT(*) OVER (PARTITION BY tool_name) AS tool_count,
      COUNT(*) OVER (PARTITION BY status) AS status_count
    FROM public.api_key_usage
    WHERE tenant_id = p_tenant_id
  ) sub;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tenant_api_usage_stats(uuid) TO authenticated;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.tenant_kb_stats(uuid);
--   DROP FUNCTION IF EXISTS public.tenant_api_usage_stats(uuid);
