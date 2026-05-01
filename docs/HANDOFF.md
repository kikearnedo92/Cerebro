# Cerebro — Handoff para continuidad

> **Leer primero al abrir cualquier sesión nueva de Claude/Cowork sobre Cerebro.**
> Este doc es la fuente de verdad del estado del proyecto y qué sigue.
>
> **Pivote estratégico 2026-04-29:** Tesis nueva = "capa de contexto operacional para humanos Y agentes IA" (validada por YC RFS Summer 2026). Discovery-first. **No construir features nuevos hasta validar wedge con 8 entrevistas (~22 jun 2026).** Detalle completo en `CLAUDE.md` y `CHANGELOG.md`.

---

## 0. Contexto en 1 minuto

**Qué es Cerebro:** SaaS B2B, "segundo cerebro" de una empresa. Chat con IA conectado a Notion, Slack, Drive, Gmail, Calendar. Responde con información real de la organización.

**Quién es el founder:** Eduardo Arnedo "Kike" (eduardo@retorna.app, WhatsApp +56 9 9307 9285). Head de CS en Retorna de lunes a viernes. Cerebro es su startup personal aparte. **No es desarrollador.** El Claude/CTO maneja todo lo técnico; Kike decide producto, hace QA, y configura lo externo (OAuth apps, Stripe, dominio).

**Deploy actual:** https://cerebro-ivory.vercel.app
**Repo:** https://github.com/kikearnedo92/Cerebro
**Supabase:** project_id = `begnklspqjxwkvwhuefr`

---

## 1. Estado al 2026-04-19

### ✅ Ya implementado y en producción
- Landing + Pricing pages
- Auth básica (signup, login, email confirmation) con Supabase
- Chat con Claude vía `/api/chat.js` (Vercel serverless)
- Knowledge Base: upload de docs, búsqueda semántica con pgvector
- UI completa: Chat, Knowledge, Users, Integrations (solo UI), Settings, Profile, Admin (stub)
- Multi-tenant schema inicial (tabla `tenants`, `profiles.tenant_id`, `is_super_admin`)

### ✅ Hecho en la sesión 2026-04-19 (esta)
- **Fix UX del chat**: input anclado abajo, autofocus, Enter envía, layout tipo Claude — `src/components/layouts/AppLayout.tsx` + `src/components/chat/EnhancedChatInterface.tsx`
- **Migración SQL** `20260419000000_multi_tenant_hardening.sql`:
  - Tabla `tenant_invitations`
  - Tabla `usage_counters`
  - Columnas OAuth en `integrations` (access_token_encrypted, refresh_token_encrypted, etc.)
  - RLS fix (la tabla `integrations` tenía RLS rota)
  - Policies super-admin
  - Funciones `handle_new_user` (acepta invitation_token), `increment_queries`, `tenant_over_query_limit`
- **Infra OAuth helpers**: `api/integrations/_lib/supabase.js` y `api/integrations/_lib/crypto.js` (AES-256-GCM)
- **Docs completos**: ROADMAP, QA_CHECKLIST, RUNBOOK, ARCHITECTURE, SALES_STRATEGY, SUPER_ADMIN_SPEC, AUTH_FLOWS, PENDING_FROM_KIKE

### ⛔ Bloqueado pendiente de Kike
Ver `docs/PENDING_FROM_KIKE.md` — resumen:
1. **GitHub Personal Access Token** para que Claude pueda pushear (`scope: repo`)
2. **SUPABASE_SERVICE_ROLE_KEY** en Vercel (crítico para búsqueda semántica del chat)
3. **Correr la migración SQL** `20260419000000_multi_tenant_hardening.sql` en Supabase SQL Editor
4. **Generar TOKEN_ENCRYPTION_KEY** (`openssl rand -hex 32`) y agregar a Vercel
5. **Crear app de Notion OAuth** (developers.notion.com) → obtener Client ID/Secret
6. **Crear proyecto Google Cloud** → OAuth credentials para Drive+Gmail+Calendar
7. **Crear app de Slack**
8. **Stripe** — diferido hasta que Kike tenga cuenta

### 📋 Pendiente de Claude (código, cuando tenga PAT)
1. Endpoints OAuth de Notion (`/api/integrations/notion/authorize.js` + `callback.js`)
2. Endpoints OAuth genéricos para Google y Slack
3. Sync jobs background (Vercel cron)
4. Super-admin UI completa (CRUD de tenants)
5. Tenant admin UI (invitaciones, members list)
6. Forgot password + password reset flows
7. Onboarding post-signup
8. Stripe Checkout + webhook
9. Limit enforcement en `/api/chat`

---

## 2. Cómo retomar (Claude futuro, léeme)

Cuando Kike abra una sesión nueva y diga "sigamos con Cerebro":

1. **Lee primero estos tres archivos**, en orden:
   - `docs/HANDOFF.md` (este) — estado y qué sigue
   - `docs/ROADMAP.md` — plan 3 meses
   - `docs/PENDING_FROM_KIKE.md` — si hay bloqueos por él, pregúntale

2. **Credenciales**: están en tu memoria persistente en `/sessions/bold-adoring-goldberg/mnt/.auto-memory/cerebro_credentials.md`. **NUNCA** pegar credenciales en el código ni en docs del repo — solo referencias a dónde viven (Vercel env vars, memoria local).

3. **Working directory**: si `/sessions/bold-adoring-goldberg/cerebro/` no existe, clona: `git clone --depth 20 https://github.com/kikearnedo92/Cerebro.git cerebro`

4. **Push al repo**: solo si Kike dio el PAT. Si no, avanza código localmente y pídelo. Configurar con:
   ```bash
   git config user.email "cerebro-claude@anthropic.com"
   git config user.name "Cerebro Claude"
   git remote set-url origin https://x-access-token:TOKEN@github.com/kikearnedo92/Cerebro.git
   ```

5. **Preferencias de comunicación con Kike**:
   - Le gusta que preguntes antes de armar planes extensos
   - Respuestas breves, claras, directas. NO escribir párrafos largos
   - Siempre actuar como CTO/co-founder, no como asistente pasivo
   - No buscar info de Cerebro en Notion de Retorna — son silos separados

6. **Decisiones ya tomadas (no relitigar)**:
   - Stack: React+Vite+Tailwind+shadcn / Supabase / Vercel / Claude API
   - Stripe es LO ÚLTIMO (Kike no tiene cuenta aún al 2026-04-19)
   - Notion es la PRIMERA integración OAuth (más barato, más diferenciador)
   - Multi-tenant con RLS estricta (un tenant no ve otros)
   - Super-admin = Kike, ve todos los tenants

7. **Si Kike dice "ya te di X (credencial, info)"**: busca en (a) tu memoria persistente, (b) el transcript de la sesión actual, (c) el archivo `docs/PENDING_FROM_KIKE.md`. Si no está en ninguno, pídelo de nuevo con honestidad.

---

## 3. Archivos clave del repo

```
cerebro/
├── docs/                    # Leer esto SIEMPRE al retomar
│   ├── HANDOFF.md          # Este archivo
│   ├── ROADMAP.md          # Plan 3 meses
│   ├── QA_CHECKLIST.md     # Checklist manual end-to-end
│   ├── RUNBOOK.md          # Pasos que Kike debe hacer en providers
│   ├── ARCHITECTURE.md     # Schema DB, flujos, seguridad
│   ├── AUTH_FLOWS.md       # Signup, login, forgot password, invite
│   ├── SUPER_ADMIN_SPEC.md # Qué tiene que poder hacer Kike como super-admin
│   ├── SALES_STRATEGY.md   # Plan para conseguir 10 clientes en 3 meses
│   └── PENDING_FROM_KIKE.md # Lista viva de bloqueos por Kike
├── api/                    # Vercel serverless functions
│   ├── chat.js
│   └── integrations/
│       ├── _lib/           # Helpers compartidos (supabase, crypto)
│       ├── notion/         # OAuth endpoints por provider
│       ├── google/
│       └── slack/
├── src/                    # Frontend React
│   ├── pages/              # Routes principales
│   ├── components/
│   └── hooks/
└── supabase/migrations/    # Schema DB, source of truth
```

---

## 4. Principios no-negociables

- **Seguridad**: tokens OAuth siempre cifrados AES-256-GCM con `TOKEN_ENCRYPTION_KEY`. Nunca plain text en DB ni logs.
- **RLS estricta**: cada tabla con `tenant_id` filtra por tenant del user. Super-admin bypass explícito.
- **No features sin QA**: antes de marcar una feature "done", corre el checklist correspondiente de `QA_CHECKLIST.md`.
- **Doc-as-code**: toda decisión de producto/arquitectura vive en `docs/`. Memoria persistente es reference, no source of truth.
- **Progresos atómicos**: commits pequeños, mensajes claros. PR-less (es solo main), pero cada commit debe dejar el sistema funcional.

---

## 5. Canales de comunicación con Kike

- **Email**: eduardo@retorna.app (canal formal, usa este para autorizaciones async)
- **WhatsApp**: +56 9 9307 9285 (no usar hasta que exista MCP de WhatsApp)
- **Claude Desktop/Cowork**: el canal principal cuando esté en sesión

Cuando Kike esté de vacaciones, asume comunicación async. Registra todo pendiente en `docs/PENDING_FROM_KIKE.md`.
