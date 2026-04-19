# CLAUDE.md — Contexto para Claude Code trabajando en Cerebro

> Este archivo lo lee Claude Code automáticamente al abrir el proyecto. Contiene toda la información necesaria para retomar el trabajo sin fricciones.

---

## Quién es el founder

**Kike** (Eduardo Arnedo) — eduardoarnedog@gmail.com (personal), WhatsApp +56 9 9307 9285.

- **No es desarrollador.** Tú manejas todo lo técnico.
- Head de Customer Success en Retorna (fintech), pero **Cerebro es su startup personal, 100% separado de Retorna**.
- Le gusta: respuestas breves, claras, directas. NO leer párrafos largos. Preguntar antes de armar planes extensos.
- Canal de comunicación durante vacaciones: email a eduardoarnedog@gmail.com (Gmail MCP). Subject format: `[Cerebro] {urgencia} - {resumen}`.

## Qué es Cerebro

SaaS B2B: **"el segundo cerebro de una empresa"**. Chat con IA conectado a Notion, Slack, Google Drive, Gmail y Calendar. Responde con la información real de la organización.

- **Target:** PYMEs 10-50 empleados
- **Precios:** Starter $49/mo, Growth $99/mo, Enterprise custom
- **Diferenciador vs. Glean:** 10x más barato, self-serve, nicho PYME
- **Meta comercial:** 10 clientes pagando en los primeros 3 meses post-launch

## Stack

- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Auth/DB: Supabase (auth + Postgres con pgvector + RLS estricta)
- Backend: Vercel Serverless Functions en `/api/*`
- LLM: Claude (Anthropic) vía `/api/chat.js`
- Pagos: Stripe (diferido, Kike aún no tiene cuenta)
- Hosting: Vercel, auto-deploy desde `main`

## URLs críticas

- **Deploy:** https://cerebro-ivory.vercel.app
- **Repo:** https://github.com/kikearnedo92/Cerebro
- **Vercel:** https://vercel.com/kikearnedo92s-projects/cerebro
- **Supabase:** https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr
- **Dominio objetivo:** usacerebro.com (no comprado aún)

## Credenciales

**Todas viven en `~/.cerebro/credentials.env`** (NO en el repo, NO en memoria de chat).
Cuando necesites una credencial: `source ~/.cerebro/credentials.env` y usa la variable.

Variables disponibles:
- `GITHUB_PAT` — para `git push` (scope `repo`, expira 2026-07-19)
- `VERCEL_TOKEN` — para `vercel` CLI y API (sin expiración)
- `SUPABASE_SERVICE_ROLE_KEY` — para SQL admin y Supabase JS server-side
- `SUPABASE_ANON_KEY` — frontend
- `ANTHROPIC_API_KEY` — para `/api/chat.js`
- `TOKEN_ENCRYPTION_KEY` — 32-byte hex para cifrar OAuth tokens
- `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET` — OAuth de Notion (ya creada en notion.so/my-integrations)

**Credenciales aún no obtenidas (Kike las genera cuando toque):**
- Google OAuth (Drive+Gmail+Calendar)
- Slack OAuth
- Stripe

**Lista completa en Vercel env vars:**
`vercel env ls` (con VERCEL_TOKEN configurado)

## Estructura del proyecto

```
Cerebro/
├── CLAUDE.md              # Este archivo
├── docs/                  # Source of truth del proyecto — leer siempre al retomar
│   ├── HANDOFF.md         # Estado actual + cómo retomar
│   ├── ROADMAP.md         # Plan 12 semanas
│   ├── DAILY_PLAN.md      # Plan día-por-día vacaciones 20 abr - 4 may
│   ├── QA_CHECKLIST.md    # Checklist manual end-to-end
│   ├── ARCHITECTURE.md    # Schema DB, flujos, seguridad
│   ├── AUTH_FLOWS.md      # Signup/login/forgot/invite specs
│   ├── SUPER_ADMIN_SPEC.md # Qué hace la página /admin
│   ├── SALES_STRATEGY.md  # Plan para conseguir 10 clientes
│   ├── CONTINUITY.md      # Cómo trabajar desde iPhone/Mac/Cowork
│   ├── RUNBOOK.md         # Pasos para crear OAuth apps en providers
│   └── PENDING_FROM_KIKE.md # Lista viva de bloqueos
├── src/
│   ├── pages/             # Routes de la app
│   ├── components/
│   └── hooks/
├── api/                   # Vercel serverless functions
│   ├── chat.js            # Chat principal con Claude
│   └── integrations/
│       ├── _lib/          # crypto.js (AES-256-GCM) + supabase.js (auth)
│       ├── notion/        # OAuth: authorize, callback, sync, disconnect
│       ├── google/        # OAuth para Drive + Gmail + Calendar
│       └── slack/         # OAuth para Slack
└── supabase/migrations/   # Schema DB, fuente de verdad
```

## Estado al 2026-04-19

### ✅ Funcionando en producción
- Landing, pricing, auth básica (signup/login/email confirm)
- Chat con Claude + contexto de knowledge base (RLS corregida 2026-04-19)
- Knowledge Base (upload + búsqueda semántica)
- Multi-tenant schema completo (tenants, tenant_invitations, usage_counters, RLS con SECURITY DEFINER helpers)
- Endpoints OAuth reales para Notion, Google, Slack (código desplegado)
- Cerebro es Public integration en Notion OAuth
- Kike es super_admin en la DB

### ⏳ Por implementar durante vacaciones de Kike (20 abr - 4 may)
Ver `docs/DAILY_PLAN.md` para el detalle día-por-día. Prioridad:
1. Notion sync con embeddings (día 1-2)
2. Google OAuth app + sync (días 3-4) — requiere Kike cree OAuth en console.cloud.google.com
3. Slack OAuth + sync (día 5) — requiere Kike cree OAuth en api.slack.com
4. Super-admin UI completa (días 6-7)
5. Tenant admin UI + invitaciones (día 8)
6. Forgot/reset password + verify email pages (días 9-10)
7. Onboarding guiado post-signup (día 11)
8. Limit enforcement en /api/chat (día 12)
9. Polish + QA mobile (días 13-14)
10. Stripe — diferido, se hace con Kike al regreso (4 may)

## Flujos de trabajo comunes

### Correr migración SQL
```bash
source ~/.cerebro/credentials.env
cd /path/to/Cerebro
# Opción A: vía Supabase CLI (si está instalado)
supabase db push --db-url "postgresql://postgres.begnklspqjxwkvwhuefr:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Opción B: vía psql directo
psql "postgresql://postgres.begnklspqjxwkvwhuefr:[DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres" -f supabase/migrations/20260419000003_fix_rls_recursion.sql

# Opción C: vía API REST de Supabase Management (necesita management token, no service_role)
```

> **Nota**: para migraciones SQL se necesita el DB password (diferente del service_role).
> Pedírselo a Kike vía email si no está en credentials.env.

### Agregar env var a Vercel
```bash
source ~/.cerebro/credentials.env
vercel env add NOMBRE production --token "$VERCEL_TOKEN"
# Luego redeploy
vercel deploy --prod --token "$VERCEL_TOKEN"
```

### Commit + push
```bash
cd /path/to/Cerebro
git add -A
git commit -m "feat: <resumen>"
git push  # PAT ya configurado en git remote
```

### Email diario a Kike (vía Gmail MCP)
Subject: `[Cerebro] Progreso día N - {resumen}`

## Principios de trabajo

- **Seguridad primero:** tokens OAuth cifrados AES-256-GCM, nunca en logs, nunca en el repo.
- **RLS estricta:** cada tabla tenant-scoped filtra por tenant. Super-admin bypass explícito con helpers `is_super_admin()`, `get_user_tenant()`, `is_tenant_admin()`.
- **No romper producción:** cambios grandes atrás de feature flags. Cada commit debe dejar el sistema funcional.
- **Actualizar docs:** después de cada cambio significativo, actualiza `docs/HANDOFF.md` y `docs/PENDING_FROM_KIKE.md`.
- **Email diario a Kike:** al final del trabajo del día, email con progreso + pendientes.

## Cuando Kike está de vacaciones

- Trabaja autónomo leyendo `docs/DAILY_PLAN.md`
- Si hay un bloqueo que solo Kike puede resolver: email `[Cerebro] URGENTE - Necesito X`
- Si un feature toma más del estimado: dividir en 2 días, no comprometer calidad
- Commits atómicos con mensajes descriptivos

## Qué NO hacer

- NO mezclar Cerebro con Retorna (son silos separados, nunca buscar info de Cerebro en Notion de Retorna)
- NO hardcodear credenciales en código
- NO desplegar sin primero probar build local (`npm run build`)
- NO tocar `public.integrations.tenant_id` (TEXT legacy) — usar solo `tenant_uuid` (UUID nuevo)
- NO eliminar `~/.cerebro/credentials.env` ni reemplazarlo sin backup
