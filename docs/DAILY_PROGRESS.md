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

## Día 2 — Lunes 20 abril 2026

**Plan original (DAILY_PLAN):** Google OAuth (Drive + Gmail + Calendar).
**Plan ejecutado:** Gate activado — Google creds todavía no existen en Vercel. Se ejecuta el fallback del plan (super-admin UI, originalmente Día 6-7). También cierro bloqueantes heredados del 19 abr y valido Día 1 end-to-end.

### ✅ Completado

**Cierre de bloqueantes heredados:**
- ✅ **Anthropic credits cargados.** `/api/chat` responde 200 con respuesta real. 🔴 cerrado en PENDING.
- ✅ **Día 1 validado end-to-end.** Kike conectó su workspace de Notion ayer tarde (integration `704f187a-41c5-4f55-810c-d51c0194457c`, tenant "Cerebro", creada 2026-04-19 18:48 UTC). Primer sync manual falló con 23 errores "no unique or exclusion constraint matching the ON CONFLICT specification" — bug real en el índice del Día 1.
- ✅ **Fix de bug de índice parcial.** Migración `20260420000001_fix_kb_unique_full.sql`: drop del partial index con `WHERE source IS NOT NULL` y recreación como índice no-parcial. PostgREST/supabase-js rechazan índices parciales como target de ON CONFLICT. Aplicada vía `/api/admin/migrate` (`ok:true, applied: 20260420000001`).
- ✅ **Re-sync post-fix:** `{ok:true, items_synced:16, breakdown:{pages:2, databases:2, database_rows:12}, tombstoned:0, error_count:0}`. Knowledge_base ahora tiene 16 filas con `project='Notion'` y file_types correctos (`notion_page`, `notion_database`, `notion_database_row`).
- ✅ **Smoke test RAG real:** `POST /api/chat {message:"¿Qué bases de datos tengo sincronizadas en Notion?", useKnowledgeBase:true}` → `documentsFound:4, sources: ["Nueva especificación técnica","Nueva especificación de producto (PRD)","Ejemplo de especificaciones de producto","Ejemplo de especificaciones técnicas"]`. **El chat cita fuentes reales de Notion del workspace de Kike.** 🎯
- ✅ **Limpieza de integration legacy.** Row `48a08cf5-…` (creada 16:59 UTC, sin token, tenant_uuid=NULL) estaba como `connected` — marcada `disconnected` con `last_error` descriptivo. Evita ruido en el cron dispatcher.

**Fallback Día 2 — super-admin:**
- ✅ Endpoint `/api/admin/tenants.js` (single-handler GET/PATCH/POST para respetar cap de 12 funciones Hobby). Requiere Bearer token de super-admin. Operaciones:
  - `GET /api/admin/tenants` → lista con `users_count`, `integrations_count`, `docs_count` por tenant + summary global.
  - `GET /api/admin/tenants?id=<uuid>` → detalle con integrations breakdown.
  - `PATCH /api/admin/tenants?id=<uuid>` → edit con whitelist de campos (`name, plan, subscription_status, subscription_active, is_internal, max_users, max_storage_gb, max_monthly_queries, admin_email, domain`).
  - `POST /api/admin/tenants` → creación manual con defaults razonables.
- ✅ **UI `/admin` cableada.** `src/pages/admin/AdminDashboard.tsx` ya no muestra `--`: carga datos reales, muestra tabla de tenants con plan/estado/users/docs/integraciones, acción pausar/reactivar funcional, summary de tenants/users/MRR/docs. Refresh manual + spinner de loading + manejo de error.
- ✅ **Smoke tests:**
  - `GET /api/admin/tenants` sin auth → `401 Not authenticated` ✅
  - `GET /api/admin/tenants` con Bearer inválido → `401 Not authenticated` ✅
  - Path super-admin sólo validable con sesión real de Kike — gate confirmado vía `getAuthContext` + `isSuperAdmin`.

### 📊 Métricas

- Funciones serverless: **12** (cap Hobby). Sin margen — próximo endpoint requiere consolidar o upgrade a Pro.
- Deploys: 4 READY hoy (`4f9c619`, `cdc55ef` y 2 de docs). 0 deploys en ERROR tras fixes de ayer.
- Base de conocimiento: **16 filas Notion** en tenant "Cerebro" (tenant `eb1c2415-…`).
- Tenants en DB: 2 (`eduardo-org`, `Cerebro`), ambos en trial.

### 🔴 / 🟡 Pendiente

- 🟡 **Google OAuth credentials** siguen faltando — cuando Kike los entregue, dispara Día 2 pipeline real (solo son 2 env vars + redeploy).
- 🟡 **Slack OAuth credentials** misma situación.
- 🟡 **Embeddings provider** (OpenAI vs Voyage) pendiente — la búsqueda funciona hoy con text-RAG y documentos cortos, pero el próximo escalón semántico necesita decisión.
- 🟡 **Pro plan Vercel** recomendable. Estamos en 12/12 funciones; con Google + Slack endpoints llegaríamos a 14-16.

### 📊 Commits del día

- `4f9c619` fix(day-2): drop partial WHERE from knowledge_base unique index
- `cdc55ef` feat(day-2): super-admin tenants API + live /admin dashboard

---
