# Cerebro — Runbook de setup

Este documento lista todo lo que Kike (founder) tiene que hacer MANUALMENTE en cada provider externo para activar las integraciones y pagos. Cada item: ~15 min.

Yo (Claude/CTO) no puedo hacer estos pasos por ti porque requieren tu login + aprobar términos. Para cada uno entrégame el `Client ID` y `Client Secret` generados y yo los meto en Vercel.

---

## 1. Notion — OAuth app

**Por qué:** permite a los clientes conectar su Notion al Cerebro.

1. Ve a https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Tipo: **"Public integration"** (necesario si Cerebro va a servir a múltiples workspaces)
4. Name: `Cerebro`
5. Logo: sube logo de Cerebro (opcional)
6. Associated workspace: tu workspace personal (para testing)
7. Capabilities: **Read content, Read user information including email**
8. Redirect URI: `https://cerebro-ivory.vercel.app/api/integrations/notion/callback`
9. Privacy policy URL: `https://cerebro-ivory.vercel.app/privacy` (creamos después)
10. Terms of use URL: `https://cerebro-ivory.vercel.app/terms` (creamos después)

**Entrega:**
- `NOTION_CLIENT_ID` (formato: `ab1c2d3e-...`)
- `NOTION_CLIENT_SECRET` (formato: `secret_...`)

---

## 2. Google Cloud — OAuth para Drive, Gmail, Calendar

**Por qué:** una sola app de Google sirve para los 3.

1. Ve a https://console.cloud.google.com/
2. Crea proyecto nuevo: `Cerebro`
3. APIs & Services → Enable APIs:
   - Google Drive API
   - Gmail API
   - Google Calendar API
4. APIs & Services → OAuth consent screen:
   - User type: **External**
   - App name: `Cerebro`
   - Support email: tu email
   - Authorized domains: `cerebro-ivory.vercel.app`
   - Scopes:
     - `.../auth/drive.readonly`
     - `.../auth/gmail.readonly`
     - `.../auth/calendar.readonly`
     - `.../auth/userinfo.email`
5. APIs & Services → Credentials → **Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Cerebro Web`
   - Authorized redirect URIs:
     - `https://cerebro-ivory.vercel.app/api/integrations/google/callback`

**Entrega:**
- `GOOGLE_CLIENT_ID` (formato: `...apps.googleusercontent.com`)
- `GOOGLE_CLIENT_SECRET` (formato: `GOCSPX-...`)

**Ojo:** Google pide verificación de la app si vas a publicar a muchos users. Para los primeros 100 users funciona sin verificar (modo "testing").

---

## 3. Slack — OAuth app

1. Ve a https://api.slack.com/apps → **Create New App** → "From scratch"
2. App Name: `Cerebro`
3. Pick workspace: tu workspace de testing
4. Basic Information → App Credentials → copia `Client ID` y `Client Secret`
5. OAuth & Permissions:
   - Redirect URL: `https://cerebro-ivory.vercel.app/api/integrations/slack/callback`
   - Bot Token Scopes:
     - `channels:read`, `channels:history`
     - `groups:read`, `groups:history`
     - `users:read`, `users:read.email`
6. Install App → Install to Workspace
7. Distribution → **Activate public distribution** (para que otros workspaces puedan instalarla)

**Entrega:**
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`

---

## 4. Stripe — Pagos

1. Ve a https://dashboard.stripe.com/register y crea cuenta (si no la tienes)
2. Mantente en **modo Test** mientras no lanzamos
3. Products → Create Product:
   - **Starter** — $49/mes recurring
   - **Growth** — $99/mes recurring
   - **Enterprise** — contact sales (sin price_id)
4. Copia los `price_id` (formato: `price_1Abc...`) de Starter y Growth
5. Developers → API Keys:
   - `STRIPE_SECRET_KEY` (sk_test_... en modo test, sk_live_... cuando lancemos)
   - `STRIPE_PUBLISHABLE_KEY` (pk_test_...)
6. Developers → Webhooks → **Add endpoint**:
   - URL: `https://cerebro-ivory.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copia el `Signing secret` (`whsec_...`)

**Entrega:**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER` (price_id)
- `STRIPE_PRICE_GROWTH` (price_id)

---

## 5. Supabase — Service role key (falta en Vercel)

1. Ve a https://supabase.com/dashboard/project/begnklspqjxwkvwhuefr/settings/api
2. Encuentra **Service Role Key** (la `secret` que empieza con `eyJ...` y tiene rol `service_role`)
3. Cópiala

**Entrega:**
- `SUPABASE_SERVICE_ROLE_KEY`

Esta key es necesaria para que el backend haga búsqueda semántica en knowledge_base.

---

## 6. Vercel — Agregar todas las env vars

Una vez que tengas las credenciales de los 5 puntos anteriores:

1. Ve a https://vercel.com/kikearnedo92/cerebro/settings/environment-variables
2. Agrega cada variable en **Production** y **Preview**
3. Redeploy

Variables finales esperadas:

```
# Supabase
VITE_SUPABASE_URL=https://begnklspqjxwkvwhuefr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# OAuth — Notion
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=

# OAuth — Google (Drive + Gmail + Calendar)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth — Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=

# Token encryption (generar con: openssl rand -hex 32)
TOKEN_ENCRYPTION_KEY=
```

---

## Orden sugerido

1. **HOY:** Supabase service role + Notion (para probar flujo completo end-to-end)
2. **Cuando quieras vender:** Stripe
3. **Conforme haya usuarios pidiéndolo:** Google, Slack
