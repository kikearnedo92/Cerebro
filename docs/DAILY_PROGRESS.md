# Cerebro — Daily Progress Log

> Una entrada por cada run de la scheduled task `cerebro-daily-dev` (9 am Chile, del 19 abril al 4 mayo 2026).
> Cada entrada: qué se hizo, qué quedó pendiente, bloqueos, commit link.

---

## Día 0 — Domingo 19 abril 2026 (setup / primer run autónomo)

**Run:** scheduled task `cerebro-daily-dev` (primera ejecución, día antes de vacaciones).

### Qué se hizo

- Cloné el repo en el sandbox, leí `HANDOFF.md`, `DAILY_PLAN.md`, `PENDING_FROM_KIKE.md`, memoria persistente (`cerebro_credentials.md`, `project_cerebro.md`).
- Verifiqué email de Kike: recibió el test de automatización (subject `[Cerebro] PRUEBA – Autorización de acceso a GitHub`) y respondió `"Aprobado todo, funciona la automatización"` a las 17:03 UTC. Canal async confirmado.
- Auditoría del código Notion OAuth (`api/integrations/notion/*.js` + `_lib/crypto.js` + `_lib/supabase.js`):
  - `authorize.js` ✅ state CSRF correcto, soporta JSON (Bearer auth) y redirect legacy
  - `callback.js` ✅ intercambio de token con Basic auth, cifra token antes de guardar, dispara sync inicial fire-and-forget
  - `sync.js` ✅ paginación de `/search` y `/blocks/:id/children` con safety caps. Caveat: sólo pages (no databases) y sin embeddings — trabajo de Día 1.
  - `disconnect.js` ✅ limpia token, mantiene knowledge_base a menos que `purge: true`
  - `crypto.js` ✅ AES-256-GCM con tag de autenticación
- Fix misleading comment en `sync.js` (decía "generates embeddings" cuando sólo guarda texto).
- Actualicé `docs/PENDING_FROM_KIKE.md` marcando los 5 items pre-vacaciones + agregando `INTERNAL_SYNC_TOKEN` (detectado como faltante en el código pero ausente en la lista de env vars).
- Creé este `docs/DAILY_PROGRESS.md`.

### Qué quedó pendiente (para Día 1, lunes 20 abril)

1. **Agregar soporte de databases de Notion** al sync (hoy sólo pages). El plan del Día 1 lo contempla.
2. **Agregar embeddings** al sync: OpenAI `text-embedding-3-small` (barato) → guardar en `knowledge_base.embedding` (pgvector). Requiere `OPENAI_API_KEY` — pedírselo a Kike por email si Day 1 lo necesita.
3. **Test E2E con Notion real** de Kike (cuando vuelva, o si me lo conecta async desde el iPhone).

### Bloqueos

- **Sandbox sin acceso de red a Vercel/Supabase/APIs externas**. El proxy bloquea `api.vercel.com` y `cerebro-ivory.vercel.app`. Consecuencia:
  - No puedo verificar env vars en Vercel autónomamente.
  - No puedo llamar `/api/admin/migrate` para correr migraciones automáticamente.
  - No puedo probar el deploy después de push (confío en el build log de Vercel + Kike).
- **Mitigación:** todo lo que solo Kike puede hacer (o que requiere red externa) está en `PENDING_FROM_KIKE.md` con instrucciones paso-a-paso para iPhone/Mac.
- **Pendiente de Kike crítico para Día 1:** correr las 4 migraciones SQL (`20260419000000…000003`) en Supabase SQL Editor y confirmar env vars. Si no están corridas, los endpoints de Notion van a fallar por tablas/columnas faltantes.

### Decisiones que necesitan input de Kike

- ¿Proveedor de embeddings? **Recomendación:** OpenAI `text-embedding-3-small` (~$0.02 por millón de tokens, 1536 dims). Alternativa: Voyage (~$0.12/M, mejor calidad en español). Para MVP, OpenAI gana en costo. Si Kike confirma, necesito `OPENAI_API_KEY` en Vercel para Día 1 o Día 2.

### Commit

Commit del Día 0 → ver `git log` del main después del push (al final de este run).

---

## Día 0.5 — Domingo 19 abril 2026, sesión nocturna (desbloqueo pre-vacaciones)

**Contexto:** Kike ejecutó, desde este Mac, la secuencia de desbloqueo antes de irse a Cowork/vacaciones. Los 5 items pre-vacaciones quedaron resueltos.

### Resultados paso-a-paso

- **Paso 0 — Credenciales locales:** `~/.cerebro/credentials.env` creado con `chmod 600`, incluyendo `GITHUB_PAT`, `VERCEL_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `TOKEN_ENCRYPTION_KEY`, `MIGRATE_SECRET`, `NOTION_CLIENT_ID/SECRET`. Fuente de verdad local para próximas sesiones.
- **Paso 1 — INTERNAL_SYNC_TOKEN generado:** `openssl rand -hex 32`, valor guardado en `credentials.env`. Usado por `api/integrations/notion/callback.js` para disparar el sync fire-and-forget.
- **Paso 2 — INTERNAL_SYNC_TOKEN en Vercel:** agregado vía `POST https://api.vercel.com/v10/projects/cerebro/env` con targets `production,preview`, type `encrypted`. Requiere redeploy para estar activo en runtime (próximo push lo dispara).
- **Paso 3 — Auditoría env vars en Vercel:** las 7 env vars críticas están presentes (`SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `MIGRATE_SECRET`, `ANTHROPIC_API_KEY`, `INTERNAL_SYNC_TOKEN` recién creada). Adicionalmente: `SUPABASE_URL`, `SUPABASE_ANON_KEY`. Nada falta.
- **Paso 4 — Migraciones SQL:** `POST /api/admin/migrate` inicialmente falló porque `_migrations` estaba vacía y el endpoint intentaba aplicar `001_initial_schema.sql` sobre un schema que ya tenía `profiles`. Arreglado: se insertaron manualmente las 34 migraciones históricas + las 4 nuevas (`20260419000000..000003`, cuyo efecto ya estaba aplicado en la DB por ejecución manual previa) en `public._migrations` vía `POST ${SUPABASE_URL}/rest/v1/_migrations` con `Prefer: resolution=merge-duplicates`. Re-ejecuté `/api/admin/migrate` → **`ok:true`, 38 skipped, 0 applied, 0 failed**. Pipeline de migraciones futuro queda operativo.
- **Paso 5 — Smoke test `/api/chat`:** `POST` con `{"message":"ping","useKnowledgeBase":false}` → HTTP 500. El endpoint llega a llamar a Anthropic correctamente (sin errores de Supabase ni de env vars), pero Anthropic devuelve 400 con `"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."`. **Request ID:** `req_011CaDsSc7TLsDL9dNMe7bBV`. **Acción bloqueante para Kike:** cargar crédito en `console.anthropic.com/settings/billing` antes del Día 1 — sin esto, el chat está caído en prod y los tests E2E de Notion RAG del lunes no corren.

### Estado post-sesión

- ✅ Todos los pipelines operativos lado Cerebro: Vercel env vars, Supabase schema, migration runner, Notion OAuth.
- 🔴 **Nuevo bloqueante descubierto (Anthropic credits)** — registrado en `PENDING_FROM_KIKE.md`.
- ⏭️ Día 1 puede arrancar con Notion sync, pero cualquier validación que dispare Claude fallará hasta que Kike cargue créditos.

---
