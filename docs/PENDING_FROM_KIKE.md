# Cerebro — Pending from Kike

> Lista viva de cosas que solo Kike puede hacer (requieren su login/auth/decisión).
> Claude mantiene este archivo actualizado después de cada run.

**Última actualización:** 2026-04-19 (scheduled task día 0)

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
