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

## Día 1 — Lunes 20 abril 2026 (sesión nocturna del 19, arranque anticipado)

**Plan original (DAILY_PLAN):** Notion end-to-end con embeddings.
**Plan ejecutado (ajustado):** Notion sync robusto + dos incidentes de infra resueltos en el camino. Embeddings quedan pendientes de decisión de proveedor (sin `OPENAI_API_KEY` hoy; text-RAG cubre MVP).

### ✅ Completado

- **Migración `20260420000000_notion_sync_fixes.sql`** aplicada vía `/api/admin/migrate`:
  - Unique partial index `knowledge_base_tenant_source_uniq` sobre `(tenant_id, source) WHERE source IS NOT NULL` — **fix de bug latente**: la versión anterior de `sync.js` hacía `upsert(..., {onConflict:'source'})` sin constraint respaldando ese upsert; la segunda corrida habría explotado.
  - Columna `metadata JSONB` en `knowledge_base` para guardar `notion_url`, `last_edited_time`, `database_id`.
  - Índice de `file_type`.
  - Respuesta: `ok:true, applied: [20260420000000_notion_sync_fixes.sql], skipped: 38, failed: null`.
- **`api/integrations/notion/sync.js` reescrito** (commit `2e86d4c`):
  - Sincroniza **pages + databases + database_rows** (antes solo pages).
  - Extrae **properties** de cada página (`title, status, multi_select, date, people, url, …`) y las concatena al contenido — hace que filas de databases sean encontrables por text-RAG aunque el body esté vacío.
  - **Tombstone** de rows sincronizadas previamente que ya no aparecen en Notion (pages eliminadas o dejadas de compartir): se marcan `active=false` en `knowledge_base`.
  - `onConflict: 'tenant_id,source'` compound — coincide con el nuevo índice único.
  - Response enriquecida: `items_synced`, `breakdown {pages, databases, database_rows}`, `tombstoned`, `error_count`, `errors[]`.
- **Dos incidentes de infra que bloqueaban prod:**
  - **Incidente A (root cause):** Vercel NO había desplegado los 5 commits posteriores a `fad3971` porque `vercel.json` definía 3 crons sub-diarios (`0 */6`, `0 */4`, `*/15`) y el plan Hobby solo permite crons diarios. Cada push devolvía `cron_jobs_limits_reached` silenciosamente. **Fix:** commit `76350fc` — schedules diarios a 12/13/14 UTC.
  - **Incidente B:** al re-deployar, Vercel devolvió `exceeded_serverless_functions_per_deployment` (13 funciones, Hobby cap = 12). **Fix:** commit `856cf43` — colapsé `apply-migrations + sync-integrations + healthcheck` en `/api/cron/daily.js` (un solo dispatcher) y bajé a 11 funciones, 1 cron. Mismo comportamiento.
- **Deploy final:** `856cf43` READY en prod.

### 🔍 Smoke tests

```bash
# 1. Sync alive sin auth → 401 Not authenticated  ✅
curl -X POST https://cerebro-ivory.vercel.app/api/integrations/notion/sync -d '{}'

# 2. Sync con internal token + integrationId inválido → 404 Integration not found  ✅
#    (confirma que auth pasa, lookup corre, respuesta controlada)
curl -H "x-internal-sync-token: $INTERNAL_SYNC_TOKEN" -d '{"integrationId":"00000000-…"}' \
     https://cerebro-ivory.vercel.app/api/integrations/notion/sync

# 3. Chat → 500, Anthropic 400 "credit balance too low"  🔴 (Kike-side)
#    request_id req_011CaDvjHw91t8eZAPAjnUn4
```

### ⚠️ Pendiente para Día 2

- **E2E real:** cuando Kike conecte su Notion workspace (desde `/app/integrations` → "Conectar Notion" en el iPhone), la primera `/callback` dispara `sync` automáticamente. En ese momento quiero verificar en logs Vercel: `items_synced > 0`, breakdown consistente, 0 errores. No puedo validarlo sin su workspace conectado.
- **Decisión de proveedor de embeddings** (OpenAI `text-embedding-3-small` vs Voyage). Mientras no exista, seguimos con `search_knowledge_semantic` (text/pg_trgm) — funcional para MVP pero pierde matices semánticos. Registrado en `PENDING_FROM_KIKE.md`.
- **Anthropic credits** sigue bloqueante para cualquier validación que toque Claude (chat, evals).

### 📊 Commits del día

- `2e86d4c` feat(day-1): Notion sync — databases, properties, tombstone, safe upsert
- `76350fc` fix(vercel): cron schedules to 1x/day (Hobby plan limit)
- `856cf43` fix(vercel): collapse 3 crons into single daily dispatcher

---
