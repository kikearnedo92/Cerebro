# Setup — Google Drive Integration

> Para Kike: pasos para activar Google Drive como conector de Cerebro.
> Tiempo total: ~15 minutos.

## Paso 1 — Crear OAuth App en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com/)
2. Click arriba izquierda → **"Select a project"** → **"NEW PROJECT"**
   - Project name: **Cerebro**
   - Click "Create"
3. Espera a que se cree (10 segundos), después selecciónalo
4. En la sidebar izquierda → **"APIs & Services"** → **"Library"**
5. Busca **"Google Drive API"** → click → **"Enable"**

## Paso 2 — Configurar OAuth Consent Screen

1. Sidebar → **"APIs & Services"** → **"OAuth consent screen"**
2. User type: **"External"** → "Create"
3. Llenar:
   - App name: **Cerebro**
   - User support email: `eduardoarnedog@gmail.com`
   - Developer contact: `eduardoarnedog@gmail.com`
4. "Save and Continue"
5. Scopes → "Add or remove scopes" → buscar y agregar:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/drive.metadata.readonly`
6. "Save and Continue"
7. Test users → agregar tu propio email mientras la app está en "Testing"
8. "Save and Continue"

## Paso 3 — Crear OAuth Client ID

1. Sidebar → **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **Cerebro Web**
5. Authorized redirect URIs → click "+ ADD URI" → pegar:
   ```
   https://cerebro-ivory.vercel.app/api/integrations/google/callback
   ```
6. "Create"
7. Te muestra **Client ID** y **Client Secret** → cópialos a un lugar seguro

## Paso 4 — Agregar credenciales a Vercel

1. Ve a [vercel.com/kikearnedo92s-projects/cerebro/settings/environment-variables](https://vercel.com/kikearnedo92s-projects/cerebro/settings/environment-variables)
2. Agregar 3 variables (Production + Preview):
   - `GOOGLE_CLIENT_ID` = (lo que copiaste arriba)
   - `GOOGLE_CLIENT_SECRET` = (lo que copiaste arriba)
   - `GOOGLE_REDIRECT_URI` = `https://cerebro-ivory.vercel.app/api/integrations/google/callback`
3. Save

## Paso 5 — Agregar credenciales a Supabase Edge Functions

1. Abre Terminal (donde ya tienes Supabase CLI)
2. Pega esto reemplazando `<TU_CLIENT_ID>` y `<TU_CLIENT_SECRET>`:

```bash
cd ~/Cerebro
supabase secrets set GOOGLE_CLIENT_ID="<TU_CLIENT_ID>"
supabase secrets set GOOGLE_CLIENT_SECRET="<TU_CLIENT_SECRET>"
supabase secrets set GOOGLE_REDIRECT_URI="https://cerebro-ivory.vercel.app/api/integrations/google/callback"
```

## Paso 6 — Deploy de la función

```bash
supabase functions deploy google-drive-integration
```

## Paso 7 — Probar en Cerebro

1. Vuelve a Vercel y espera el redeploy (auto cuando se mergee este PR)
2. `cerebro-ivory.vercel.app/app/integrations`
3. Click en **"Conectar"** del card de Google Drive
4. Autoriza en Google
5. Vuelves a Cerebro → debería decir "Conectado"
6. Click "Sincronizar ahora" → trae tus archivos de Drive
7. Pregúntale a Cerebro algo de tu Drive

## Troubleshooting

- **"redirect_uri_mismatch":** la URI en Google Cloud Console NO coincide con la del .env. Verifica que sean exactamente iguales (incluyendo https:// y sin trailing slash).
- **"Cerebro no aparece en mi consent screen":** la app está en "Testing" y tu email no está en "Test users". Agregalo en Paso 2.
- **"Drive sync trajo 0 archivos":** verifica que tengas archivos en Drive y que no sean todos de tipos no soportados (PDFs requieren extracción de texto, en TODO).

---

## Estado del código (2026-05-05)

### ✅ Ya existe (commits anteriores):
- `src/lib/integrations.ts` — Definición de Google Drive como integración
- `src/hooks/useIntegrations.ts` — Hook que maneja estado de integraciones
- `src/components/integrations/IntegrationCard.tsx` — UI del card
- `api/integrations/google/authorize.js` — endpoint que redirige a Google OAuth
- `api/integrations/google/callback.js` — endpoint que recibe el code de Google

### ✅ Construido en este PR:
- `supabase/functions/google-drive-integration/index.ts` — Edge Function que hace:
  - `action: 'authorize_url'` → genera URL de OAuth (alternativa a authorize.js)
  - `action: 'connect'` → intercambia code por tokens y los guarda
  - `action: 'list_folders'` → lista folders del Drive del usuario
  - `action: 'sync'` → trae archivos y los indexa en knowledge_base
  - `action: 'disconnect'` → revoca tokens

### 🟡 TODO antes de usar (mañana 2026-05-06):
1. Crear OAuth app en Google Cloud Console (Pasos 1-3 arriba)
2. Agregar credenciales a Vercel env vars (Paso 4)
3. Agregar credenciales a Supabase secrets (Paso 5)
4. Deploy de la función: `supabase functions deploy google-drive-integration`
5. Probar el flow end-to-end
6. Si hay incompatibilidad entre `integrations` table (usada por authorize.js)
   y `integrations_config` table (usada por la edge function nueva), unificar.
