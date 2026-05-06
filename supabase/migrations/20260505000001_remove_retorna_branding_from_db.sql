-- =====================================================================
-- Limpieza de branding "Retorna" del DB
-- Fecha: 2026-05-05
-- Motivo: Cerebro es producto independiente. La regla #2 del master_brief
--         prohíbe mencionar Retorna en código/copy/branding. Esta migration
--         actualiza datos en DB que arrastraban referencias.
-- =====================================================================

-- 1. Actualizar el system prompt de cerebro_config
--    Antes: "Eres CEREBRO AI, el asistente inteligente de Retorna..."
--    Ahora: posicionamiento neutral + tesis dual
UPDATE public.cerebro_config
SET system_prompt = 'Eres CEREBRO AI, la capa de contexto operacional de la empresa. Respondes con información real basada en los documentos y fuentes conectadas (Notion, Slack, Drive, etc). Tu personalidad es profesional pero cercana. Hablas en español de manera natural y conversacional. Si no tienes información sobre un tema en las fuentes disponibles, lo dices claramente — no inventas. Citas siempre la fuente cuando respondes.',
    name = COALESCE(NULLIF(name, 'Retorna'), 'Cerebro'),
    updated_at = NOW()
WHERE name = 'Retorna' OR system_prompt LIKE '%asistente inteligente de Retorna%';

-- 2. Renombrar el tenant default si todavía se llama "Retorna"
--    (es el primer tenant del seed inicial)
UPDATE public.tenants
SET name = 'Workspace personal',
    subdomain = CASE WHEN subdomain = 'retorna' THEN 'workspace' ELSE subdomain END,
    updated_at = NOW()
WHERE name = 'Retorna' AND subdomain = 'retorna';

-- 3. Asegurar que eduardoarnedog@gmail.com sea super_admin (la regla)
--    y QUITAR super_admin de cualquier @retorna.app que haya quedado
UPDATE public.profiles
SET is_super_admin = true,
    role_system = 'super_admin'
WHERE email = 'eduardoarnedog@gmail.com';

UPDATE public.profiles
SET is_super_admin = false,
    role_system = CASE WHEN role_system = 'super_admin' THEN 'user' ELSE role_system END
WHERE email LIKE '%@retorna.app';

-- 4. Comentario para auditoría
COMMENT ON TABLE public.cerebro_config IS 'Configuración global de Cerebro. system_prompt no debe mencionar empresas específicas (regla del silo).';
