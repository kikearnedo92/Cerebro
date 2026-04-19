# Cerebro — Arquitectura

## Overview

Cerebro es una web SaaS multi-tenant. Cada cliente (tenant) tiene:
- Sus propios usuarios
- Su propia knowledge base (docs subidos + integraciones conectadas)
- Su propio historial de chat
- Su propio plan de suscripción

Un **super-admin** (Kike) ve y administra todos los tenants desde `/admin`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind + shadcn/ui |
| Routing | react-router-dom v6 |
| State / data | @tanstack/react-query, Supabase client |
| Auth | Supabase Auth (email/password + magic link) |
| DB | Supabase PostgreSQL + pgvector para búsqueda semántica |
| Storage | Supabase Storage (bucket `documents`) |
| Backend | Vercel Serverless Functions (Node.js) en `/api/*` |
| LLM | Claude (Anthropic) vía `/api/chat.js` |
| Pagos | Stripe Checkout + webhooks |
| Hosting | Vercel (auto-deploy from `main` branch) |

---

## Modelo de datos multi-tenant

```
tenants
  id (uuid, pk)
  name (text)              # ej. "Acme Corp"
  slug (text, unique)      # ej. "acme"
  plan (text)              # 'starter' | 'growth' | 'enterprise'
  stripe_customer_id (text, nullable)
  stripe_subscription_id (text, nullable)
  subscription_active (bool)
  created_at (timestamptz)
  settings (jsonb)         # branding, logo, etc.

profiles                   # extiende auth.users de Supabase
  id (uuid, pk, fk → auth.users)
  tenant_id (uuid, fk → tenants)
  role (text)              # 'super_admin' | 'tenant_admin' | 'member'
  full_name (text)
  avatar_url (text)

tenant_invitations
  id (uuid, pk)
  tenant_id (uuid, fk → tenants)
  email (text)
  role (text)              # 'tenant_admin' | 'member'
  invited_by (uuid, fk → profiles)
  token (text, unique)
  expires_at (timestamptz)
  accepted_at (timestamptz, nullable)

conversations
  id (uuid, pk)
  tenant_id (uuid, fk)
  user_id (uuid, fk)
  title (text)
  created_at, updated_at

messages
  id (uuid, pk)
  conversation_id (uuid, fk)
  role (text)              # 'user' | 'assistant'
  content (text)
  sources (jsonb)
  created_at

knowledge_base
  id (uuid, pk)
  tenant_id (uuid, fk)
  title (text)
  content (text)
  embedding (vector(1536))  # pgvector
  source_type (text)        # 'upload' | 'notion' | 'slack' | 'drive' | ...
  source_id (text)          # id original en la plataforma
  project (text)            # categoría libre
  file_url (text)
  active (bool)
  created_at

integration_connections
  id (uuid, pk)
  tenant_id (uuid, fk)
  provider (text)           # 'notion' | 'slack' | 'google_drive' | 'gmail' | 'google_calendar'
  status (text)             # 'disconnected' | 'connecting' | 'connected' | 'error'
  access_token_encrypted (text)
  refresh_token_encrypted (text)
  token_expires_at (timestamptz)
  metadata (jsonb)          # workspace_id, scopes, user_info
  connected_by (uuid, fk → profiles)
  connected_at (timestamptz)
  last_sync_at (timestamptz)
  sync_status (text)
  items_synced (int)

usage_counters                # para limits por plan
  tenant_id (uuid, pk)
  period_start (date)         # primer día del mes
  queries_count (int)
  docs_count (int)
  storage_bytes (bigint)
```

**RLS (Row Level Security):** toda tabla con `tenant_id` tiene policies que filtran por el `tenant_id` del usuario autenticado. `super_admin` puede ver todo.

---

## Flujos clave

### Signup nuevo cliente
1. Usuario va a `/auth` → signup con email/password
2. Supabase envía email de confirmación
3. Usuario confirma → trigger crea:
   - `tenants` nuevo (si no vino por invitación)
   - `profile` con `role='tenant_admin'` + `tenant_id`
4. Redirect a `/app/chat`

### Signup por invitación
1. Tenant admin invita email → `tenant_invitations` row + email con link `?invitation=token`
2. Invitado abre el link → signup
3. Al confirmar → trigger usa el token para:
   - `profile` con `tenant_id=invitation.tenant_id`, `role=invitation.role`
   - marca `invitation.accepted_at`

### Chat
1. Usuario escribe mensaje
2. Frontend llama `POST /api/chat` con `{ message, conversationId, useKnowledgeBase }`
3. Backend:
   a. Valida session Supabase
   b. Si `useKnowledgeBase`: hace búsqueda semántica en `knowledge_base` filtrada por `tenant_id`
   c. Llama Claude con contexto + historial
   d. Guarda `messages` row con `sources`
   e. Incrementa `usage_counters.queries_count`
4. Stream de respuesta al frontend

### Conectar integración (ej. Notion)
1. Usuario click "Conectar Notion" en `/app/integrations`
2. Frontend abre `/api/integrations/notion/authorize` → redirige a Notion OAuth
3. Usuario autoriza en Notion → Notion redirige a `/api/integrations/notion/callback?code=...`
4. Backend:
   a. Intercambia `code` por `access_token`
   b. Cifra token con `TOKEN_ENCRYPTION_KEY` (AES-256-GCM)
   c. Upsert `integration_connections` para este tenant+provider
   d. Dispara sync inicial async
5. Redirect a `/app/integrations?connected=notion`

### Sync de integración
- Edge function/Vercel cron cada N horas
- Por cada `integration_connections` activo:
  - Descifra token
  - Llama API del provider (ej. Notion search)
  - Parsea y inserta/updatea `knowledge_base` rows con `source_type=provider`
  - Genera embeddings con Voyage/OpenAI/etc. y mete en `embedding`
  - Update `last_sync_at`, `items_synced`

### Stripe checkout
1. Usuario en `/pricing` click "Elegir Starter"
2. Frontend llama `POST /api/stripe/checkout` con `{ priceId }`
3. Backend crea Checkout Session con `metadata.tenant_id`
4. Redirect a Stripe
5. Usuario paga → Stripe redirige a `/pricing/success`
6. Stripe llama webhook `/api/stripe/webhook`:
   - `checkout.session.completed` → update `tenants` con `stripe_customer_id`, `stripe_subscription_id`, `plan`, `subscription_active=true`
   - `customer.subscription.deleted` → `subscription_active=false`

---

## Seguridad

- **Tokens de integración:** cifrados con AES-256-GCM usando `TOKEN_ENCRYPTION_KEY` (32 bytes hex en env). Nunca salen sin cifrar del backend.
- **RLS:** todas las tablas tenant-scoped filtradas a nivel DB.
- **CORS:** `/api/chat` y `/api/integrations/*` solo aceptan origen `cerebro-ivory.vercel.app` (actualizar cuando migremos a usacerebro.com).
- **Rate limiting:** por tenant — via `usage_counters` checked en cada chat.
- **Stripe webhook:** verificamos firma con `STRIPE_WEBHOOK_SECRET` antes de procesar.
- **Super-admin:** rol check en cada endpoint admin — `profile.role === 'super_admin'`.

---

## Deploy

- Push a `main` → Vercel auto-deploy
- Migrations de Supabase viven en `supabase/migrations/*.sql` y se aplican manualmente (por ahora)
- Env vars configuradas en Vercel (ver `docs/RUNBOOK.md`)
