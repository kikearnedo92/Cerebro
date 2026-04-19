# Cerebro — Pending from Kike

> Lista viva de cosas que solo Kike puede hacer (requieren su login/auth/decisión).
> Claude debe mantener este archivo actualizado después de cada sesión.

**Última actualización:** 2026-04-19

---

## 🔴 BLOQUEANTES (sin esto, Claude no puede avanzar)

### 1. GitHub Personal Access Token (crítico)

**Por qué:** sin PAT, Claude no puede pushear cambios al repo → nada llega a producción.

**Cómo:**
1. Ve a https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Nombre: `cerebro-claude`
4. Expiration: 90 days (para cubrir vacaciones)
5. Scope: marca solo **`repo`** (acceso completo a repos)
6. Click "Generate" → cópialo
7. Pégalo en la próxima conversación con Claude: "mi PAT es ghp_xxx"

---

### 2. SUPABASE_SERVICE_ROLE_KEY en Vercel

**Por qué:** el `/api/chat.js` actual intenta buscar en knowledge_base con service role, pero la env var falta → el chat responde sin contexto de docs.

**Cómo:**
1. https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr/settings/api
2. En "Legacy anon, service_role API keys" → copia la `service_role` (empieza con `eyJ...`)
3. Ve a https://vercel.com/kikearnedo92/cerebro/settings/environment-variables
4. Add: `SUPABASE_SERVICE_ROLE_KEY` = <la key copiada>
5. Aplica a Production + Preview
6. Redeploy

---

### 3. TOKEN_ENCRYPTION_KEY en Vercel

**Por qué:** los OAuth tokens (Notion, Google, Slack) se guardan cifrados con AES-256-GCM. Sin esta key no podemos cifrar/descifrar.

**Cómo:**
1. Abre Terminal en tu Mac (vía RustDesk)
2. Corre: `openssl rand -hex 32`
3. Copia el output (64 caracteres hex)
4. En Vercel env vars: `TOKEN_ENCRYPTION_KEY` = <output>
5. **Guárdalo también en un sitio seguro** (1Password o similar) — si lo pierdes, los tokens guardados son irrecuperables.

---

### 4. Correr migración SQL en Supabase

**Por qué:** la nueva migración agrega tablas (`tenant_invitations`, `usage_counters`) y arregla RLS rota de `integrations`.

**Cómo:**
1. Descarga el archivo `supabase/migrations/20260419000000_multi_tenant_hardening.sql` del repo (o úsalo desde GitHub web)
2. https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr/sql/new
3. Copia + pega todo el contenido
4. Click "Run"
5. Debería decir "Success. No rows returned"

> Si Kike no puede desde iPhone, Claude puede guardar copia en `/mnt/outputs/` y dar link directo al archivo.

---

## 🟡 Para habilitar integraciones OAuth (cuando toque cada una)

### 5. Notion — Crear integration OAuth pública

**Paso a paso detallado en `docs/RUNBOOK.md` sección 1.**

Resumen:
- https://www.notion.so/my-integrations → New integration (Public)
- Redirect URI: `https://cerebro-ivory.vercel.app/api/integrations/notion/callback`
- Entregar a Claude: `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`

### 6. Google Cloud — OAuth app para Drive + Gmail + Calendar

**Paso a paso en `docs/RUNBOOK.md` sección 2.**

Entregar: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 7. Slack — OAuth app

**Paso a paso en `docs/RUNBOOK.md` sección 3.**

Entregar: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`

---

## 🟢 Diferido (no urgente)

### 8. Stripe

Kike no tiene cuenta aún. Cuando la cree, seguir `docs/RUNBOOK.md` sección 4.

### 9. Dominio `usacerebro.com`

Comprar en Namecheap/Vercel Domains. Apuntar DNS a Vercel. Actualizar Supabase redirect URLs.

### 10. Logo + branding

Kike a producir. Actualizar `public/favicon.svg`, logo en Landing y Sidebar.

---

## Flujo de autorización async (durante vacaciones)

Cuando Claude necesite algo de Kike estando él de vacaciones:

1. Claude escribe un borrador de email con subject `[Cerebro] Necesito X — urgencia: alta|media|baja`
2. Lo envía vía Gmail MCP a `eduardo@retorna.app`
3. Kike responde desde el iPhone con la credencial/autorización
4. En la siguiente sesión, Kike pega la respuesta o Claude lee el correo y procede

---

## Checklist de "todo listo para vacaciones"

Antes de que Kike se vaya, Claude debe confirmar:

- [ ] PAT de GitHub entregado (1)
- [ ] SUPABASE_SERVICE_ROLE_KEY en Vercel (2)
- [ ] TOKEN_ENCRYPTION_KEY en Vercel (3)
- [ ] Migración SQL ejecutada (4)
- [ ] Al menos Notion OAuth activo (5) — así Claude puede trabajar en sync logic
- [ ] Archivo `docs/HANDOFF.md` actualizado con estado actual
- [ ] Chat de Claude Desktop accesible desde iPhone con el proyecto conectado
