# Cerebro — Pending from Kike

> Lista viva de cosas que solo Kike puede hacer (requieren su login/auth/decisión).
> Claude mantiene este archivo actualizado después de cada run.

**Última actualización:** 2026-04-19 (sesión nocturna — desbloqueo pre-vacaciones ejecutado)

---

## ✅ RESUELTOS antes de vacaciones

| # | Item | Estado | Notas |
|---|---|---|---|
| 1 | GitHub PAT para push autónomo | ✅ Entregado | `ghp_A79x…ZEr4j`, expira 2026-07-19 |
| 2 | SUPABASE_SERVICE_ROLE_KEY | ✅ Entregada | Guardada en memoria; Kike: confirmar que está en Vercel env vars |
| 3 | TOKEN_ENCRYPTION_KEY | ✅ Generada | `8957acb6…b90a`, 64 hex chars; Kike: confirmar en Vercel |
| 4 | Migración SQL multi-tenant | ⚠️ Pendiente de correr | Hay 4 archivos en `supabase/migrations/20260419000*`. Ver **Acción inmediata** abajo |
| 5 | Notion OAuth app | ✅ Creada | Client ID/Secret guardados en memoria; Kike: confirmar que están en Vercel env vars |

---

## 🔴 BLOQUEANTE CRÍTICO — Anthropic credits (abierto desde 2026-04-19)

**Anthropic API credit balance = 0.** Smoke test de `/api/chat` en prod devuelve 400 de Anthropic: `"Your credit balance is too low"`. Hasta que se cargue crédito, **el chat está caído en prod** y los tests E2E del Día 1 (Notion RAG citando fuentes) no pueden correr. Re-verificado 2026-04-19 23:00 UTC y 2026-04-20 00:15 UTC — sigue igual.

- **Acción:** ir a https://console.anthropic.com/settings/billing y cargar al menos USD 20 (alcanza sobrado para todo el periodo de vacaciones).
- **Urgencia:** hacer antes del lunes 20 abril, idealmente desde el iPhone esta noche.
- **Validación:** cuando esté cargado, `curl -X POST -H "Content-Type: application/json" -d '{"message":"hola","useKnowledgeBase":false}' https://cerebro-ivory.vercel.app/api/chat` debería devolver un JSON con `response` no vacío.

## 🟡 Decisión pendiente — proveedor de embeddings

El chat usa hoy `search_knowledge_semantic` (text search vía ILIKE + pg_trgm). Funcional para MVP pero pierde matices semánticos. Para cerrar el “RAG real” del Día 1 necesito una de:

- **OpenAI `text-embedding-3-small`** (recomendada): ~$0.02 por millón de tokens, 1536 dims. Necesito `OPENAI_API_KEY` en Vercel.
- **Voyage `voyage-3-lite`**: ~$0.02–0.06/M tokens, mejor calidad en ES. Necesito `VOYAGE_API_KEY`.

Si no tomás decisión, sigo con text search — chat funciona, solo menos "smart" en queries abstractas.

## 🟡 Conexión Notion pendiente

Los endpoints están desplegados y validados (auth OK, 401/404 predecibles). Para validar la ruta end-to-end (sync real → filas en `knowledge_base` → chat citando páginas) necesito que conectes tu workspace personal de Notion desde `/app/integrations` → botón "Conectar Notion". El flujo completo corre desde el iPhone.

## 🟢 Pro-tip — considerar upgrade a Vercel Pro

Pasamos rozando dos límites de Hobby hoy (12 functions/deploy, 1 cron/day). Mientras agregamos Google + Slack OAuth más días de esta semana, podríamos volver a chocar. Pro = $20/mes, da holgura real. Decisión tuya, documentado.

---

## ✅ Ejecutado 2026-04-19 noche (desde este Mac)

| Item | Estado |
|---|---|
| `~/.cerebro/credentials.env` creado (chmod 600) | ✅ |
| `INTERNAL_SYNC_TOKEN` generado | ✅ `916ace40…5080` |
| `INTERNAL_SYNC_TOKEN` agregado a Vercel (production+preview, encrypted) | ✅ |
| Auditoría env vars Vercel completa | ✅ 7/7 presentes + SUPABASE_URL/ANON_KEY |
| Migración SQL corrida vía `/api/admin/migrate` | ✅ `ok:true`, 38 skipped, 0 applied (ya estaban aplicadas manualmente) |
| `_migrations` table poblada con todas las migraciones históricas | ✅ futuro `migrate` solo aplica migraciones nuevas |
| Smoke test `/api/chat` | ⚠️ 500 por Anthropic credit balance — ver bloqueante arriba |

---

## 🔴 Acciones inmediatas de Kike ANTES de irse (o primer día que pueda)

**El scheduled task autónomo no puede hacer llamadas HTTP fuera de GitHub** (el sandbox tiene allowlist restrictivo). Por eso necesito que Kike verifique/ejecute lo siguiente desde su Mac o iPhone:

### A. Confirmar env vars en Vercel

Abrir https://vercel.com/kikearnedo92s-projects/cerebro/settings/environment-variables y verificar que estas están en **Production**:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   ← crítico para chat y OAuth
ANTHROPIC_API_KEY
TOKEN_ENCRYPTION_KEY        ← crítico para OAuth
MIGRATE_SECRET              ← ya generado, permite que Claude corra migraciones
NOTION_CLIENT_ID
NOTION_CLIENT_SECRET
INTERNAL_SYNC_TOKEN         ← NUEVO: generar con `openssl rand -hex 32`, usado para que callback dispare sync
```

Si falta alguna, agregarla. Si falta `INTERNAL_SYNC_TOKEN`, generar con `openssl rand -hex 32` y guardarla también en 1Password.

### B. Correr la migración SQL

Opción rápida (desde iPhone vía GitHub web):

1. Abrir https://github.com/kikearnedo92/Cerebro/tree/main/supabase/migrations
2. Abrir cada uno de estos 4 archivos, copiar todo el contenido:
   - `20260419000000_multi_tenant_hardening.sql`
   - `20260419000001_multi_tenant_bootstrap.sql`
   - `20260419000002_multi_tenant_fix.sql`
   - `20260419000003_fix_rls_recursion.sql`
3. Abrir https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr/sql/new en cada uno, pegar y Run.

**Opción autónoma (preferida si Kike tiene tiempo):** una vez `MIGRATE_SECRET` esté en Vercel y el código actualizado deployado, Kike puede correr desde su Terminal:

```bash
curl -X POST -H "x-admin-migrate-secret: 17fce02fb4b3eaed5701c2d2c7794e004b96978f8369efa61e8d0a8353e5d604" \
  https://cerebro-ivory.vercel.app/api/admin/migrate
```

Esto aplica las migraciones pendientes automáticamente (y trackea cuáles ya corrieron). Si devuelve `bootstrapRequired: true`, hay que pegar el `bootstrapSql` del response una sola vez en Supabase SQL Editor y reintentar.

---

## 🟡 Para habilitar integraciones OAuth (cuando toque cada día del plan)

### Día 1 (20 abril) — Notion end-to-end
Sin bloqueo si A y B de arriba están hechos.

### Día 2-3 (21-22 abril) — Google OAuth (Drive + Gmail + Calendar)
**Falta:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Paso a paso en `docs/RUNBOOK.md` sección 2
- Redirect URI: `https://cerebro-ivory.vercel.app/api/integrations/google/callback`

### Día 4 (23 abril) — Slack OAuth
**Falta:** `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
- Paso a paso en `docs/RUNBOOK.md` sección 3
- Redirect URI: `https://cerebro-ivory.vercel.app/api/integrations/slack/callback`

> Si Google/Slack no están listos cuando toque el día, el scheduled task salta al siguiente bloque (super-admin UI / auth flows) y vuelve cuando Kike entregue credenciales.

---

## 🟢 Diferido (no urgente)

| # | Item | Notas |
|---|---|---|
| 8 | Stripe | Kike no tiene cuenta. Se aborda juntos el 4 de mayo |
| 9 | Dominio `usacerebro.com` | Comprar en Namecheap/Vercel Domains |
| 10 | Logo + branding | Kike a producir |

---

## Flujo de autorización async (durante vacaciones)

Cuando Claude necesite algo de Kike estando él de vacaciones:

1. Scheduled task detecta bloqueo → crea draft de email con subject `[Cerebro] URGENTE día N – bloqueado por X`
2. Envía vía Gmail MCP a `eduardoarnedog@gmail.com`
3. Kike responde desde el iPhone con la credencial/autorización o simplemente ejecuta la acción desde el iPhone
4. El siguiente run del scheduled task relee el email (step 1.4 del SKILL.md) y ajusta el plan

---

## Checklist "todo listo para vacaciones"

- [x] PAT de GitHub entregado
- [x] SUPABASE_SERVICE_ROLE_KEY entregada (Kike: confirmar que está en Vercel)
- [x] TOKEN_ENCRYPTION_KEY generada (Kike: confirmar que está en Vercel)
- [ ] Migración SQL ejecutada en Supabase (Kike: **hacer hoy 19 abril**)
- [x] Notion OAuth credentials entregadas (Kike: confirmar que están en Vercel)
- [ ] `INTERNAL_SYNC_TOKEN` generado y en Vercel (Kike: **hacer hoy 19 abril**)
- [x] Documentos `docs/HANDOFF.md`, `DAILY_PLAN.md`, `DAILY_PROGRESS.md` al día
