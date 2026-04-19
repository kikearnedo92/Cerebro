# Cerebro — Plan diario 20 abril – 4 mayo (vacaciones de Kike)

**Objetivo:** Kike vuelve el 4 de mayo con el MVP completo — solo Stripe pendiente (lo hacemos juntos al regreso).

**Modo de trabajo:** tarea programada diaria `cerebro-daily-dev` se ejecuta a las 9 am Chile. Cada día avanza según este plan y actualiza `docs/DAILY_PROGRESS.md` con lo hecho + lo que queda + bloqueos.

**Comunicación:** si Claude se bloquea por algo que solo Kike puede hacer, manda email a `eduardoarnedog@gmail.com` con subject `[Cerebro] URGENTE – Necesito X` y el task se pausa hasta respuesta.

---

## Pre-vacaciones — CHECKLIST no-negociable (Kike hoy 19 abril)

Sin estas 5 cosas, el desarrollo autónomo no puede arrancar. Tiempo total: 20 min.

- [ ] **1. GitHub PAT** (github.com/settings/tokens → scope `repo` → 90 días → cópialo a Claude)
- [ ] **2. SUPABASE_SERVICE_ROLE_KEY en Vercel** (copiar de Supabase → Settings → API → Legacy → agregar a Vercel env vars)
- [ ] **3. TOKEN_ENCRYPTION_KEY en Vercel** (abrir terminal en el Mac: `openssl rand -hex 32` → copiar output → Vercel env var)
- [ ] **4. Correr migración SQL** (pegar `supabase/migrations/20260419000000_multi_tenant_hardening.sql` en Supabase SQL Editor → Run)
- [ ] **5. Notion OAuth app** (notion.so/my-integrations → New Public integration → redirect URI `https://cerebro-ivory.vercel.app/api/integrations/notion/callback` → entregar Client ID + Secret a Claude)

**Bonus si da tiempo (Google y Slack, para que los días 3–5 no se bloqueen):**
- [ ] Google Cloud OAuth app (ver RUNBOOK sección 2)
- [ ] Slack OAuth app (ver RUNBOOK sección 3)

Si Kike no alcanza a hacer Google y Slack antes de irse, la tarea diaria salta esos días y trabaja en super-admin/auth/polish. Cuando llegue de vacaciones o los haga por email, retoma.

---

## Calendario día por día

### Domingo 19 abril (HOY) — Setup + pre-vacaciones
**Claude esta sesión (ya en curso):**
- [x] Fix UX del chat
- [x] Migración SQL multi-tenant
- [x] Docs completos (ROADMAP, HANDOFF, ARCHITECTURE, AUTH_FLOWS, SUPER_ADMIN_SPEC, SALES_STRATEGY, CONTINUITY, PENDING_FROM_KIKE)
- [x] Helpers backend (crypto, supabase auth)
- [x] DAILY_PLAN.md (este archivo)
- [ ] Endpoints OAuth Notion (authorize + callback + disconnect + sync) → en curso
- [ ] Endpoints OAuth Google + Slack (código base, enabled cuando haya credentials)
- [ ] Super-admin UI skeleton (lista de tenants, detalle, edit)
- [ ] Auth flows: forgot password, reset password, verify email page
- [ ] Crear scheduled task `cerebro-daily-dev` para ejecución automática
- [ ] Sales deliverables iniciales (plantilla sheet LinkedIn, mensajes outreach)

**Kike hoy:** ejecutar checklist pre-vacaciones (5 items arriba).

---

### Lunes 20 abril — Notion end-to-end
- Pull de contenido de Notion: páginas + databases
- Procesar contenido → embeddings (OpenAI text-embedding-3-small por costo, o Voyage)
- Insertar en `knowledge_base` con `source_type='notion'`, `source_id=page_id`
- Tests manuales: conectar Kike su Notion personal → verificar que chat cita páginas reales
- **Gate:** si falla, email a Kike pidiendo debug

### Martes 21 abril — Google OAuth (Drive + Gmail + Calendar)
- Endpoints `/api/integrations/google/authorize` + `/callback` con scopes combinados
- UI de connect/disconnect en `/app/integrations`
- **Gate:** si Kike no entregó Google credentials, saltar a super-admin UI (miércoles)

### Miércoles 22 abril — Google sync jobs
- Drive: listar docs, extraer texto, indexar
- Gmail: últimos 300 hilos (subject + primer mensaje)
- Calendar: próximas 2 semanas
- **Importante:** cada uno paginado, manejar rate limits de Google API

### Jueves 23 abril — Slack OAuth + sync
- Endpoints OAuth Slack
- Sync de canales públicos (mensajes últimos 30 días)
- **Gate:** si Slack credentials faltan, saltar a super-admin y volver después

### Viernes 24 abril — Super-admin UI parte 1
- Página `/admin` con dashboard cards (tenants, MRR estimado, queries)
- Página `/admin/tenants` con lista + filtros + búsqueda
- Backend `/api/admin/tenants` endpoints

### Sábado 25 abril — Super-admin UI parte 2
- Página detalle `/admin/tenants/:id` con tabs (Overview, Users, Usage, Integrations, Settings, Billing)
- Backend endpoints edit, pause, resume, delete, impersonate

### Domingo 26 abril — Tenant admin UI
- Página `/app/users` completa: lista, invitar (con `tenant_invitations`), cambiar rol
- Endpoint `/api/invitations/send` que manda email con token
- Email template de invitación (HTML bonito)

### Lunes 27 abril — Auth flows parte 1
- Página `/auth/forgot` con form
- Página `/auth/reset` con form nueva password
- Supabase config: email template customizado de reset

### Martes 28 abril — Auth flows parte 2
- Página `/auth/confirmed` post-verificación
- Supabase email template de confirmación customizado
- Invitation signup: `/auth?invitation=token` pre-filled email, trigger auto-join tenant

### Miércoles 29 abril — Limit enforcement + usage dashboard
- `/api/chat` verifica `tenant_over_query_limit()` antes de llamar Claude
- Si over limit: respuesta "Alcanzaste límite del plan, upgrade"
- Dashboard `/app/settings/usage` mostrando queries/docs/storage actuales

### Jueves 30 abril — Onboarding guiado
- Componente `OnboardingModal.tsx` con 3 pasos post-signup:
  1. Bienvenida + conectar primera integración O subir primer doc
  2. Hacer primera pregunta en chat
  3. Invitar a un compañero (opcional)
- Skip disponible pero track en `profiles.onboarding_completed_at`

### Viernes 1 mayo — Polish + QA bloques A-E
- Ejecutar todo el QA_CHECKLIST.md bloques A a E
- Fix bugs encontrados
- Accessibility review básico (contraste, focus states, keyboard nav)

### Sábado 2 mayo — Polish mobile + edge cases
- Test completo en iPhone Safari (el mismo flujo que hace Kike)
- Fix layouts rotos en mobile
- Error states: qué pasa si OAuth falla, si Claude API falla, si Supabase está down
- Loading states en todo

### Domingo 3 mayo — Sales deliverables + preparar regreso
- Plantilla Google Sheet de outreach LinkedIn con 100 filas vacías
- 10 variaciones del mensaje outreach por vertical (consultoría, SaaS, agencias, legal, finanzas)
- Email template "red personal" para Kike mandar a founders que conoce
- Borrador del primer blog post técnico ("How we built a multi-tenant RAG")
- Script de demo 10 min (Kike lo graba en Loom cuando vuelva)
- Actualizar `docs/HANDOFF.md` con estado final
- Email a Kike: "Volví listo para el 4 de mayo, aquí lo que está listo y lo que queda"

### Lunes 4 mayo — Día de regreso de Kike
- QA final con Kike (juntos en Cowork)
- Configurar Stripe (único pendiente)
- Lanzamiento soft a 5 contactos de la red personal de Kike

---

## Riesgos previstos del trabajo autónomo

| Riesgo | Mitigación |
|---|---|
| Scheduled task crashea | Cada run es independiente; si uno falla, el siguiente lo retoma |
| Código rompe producción | Todo push a `main` corre Vercel build; si falla, rollback automático |
| Kike no responde email bloqueante | Task se pausa y retoma cuando responda |
| Task consume mucho contexto/tokens | Cada run tiene scope limitado al día; no reabre el proyecto entero |
| Kike cambia de opinión durante vacaciones | Manda email, yo ajusto plan al siguiente día |

---

## Emails que Kike recibirá

1. **Diario** al completar trabajo del día (9 pm Chile):
   - Subject: `[Cerebro] Progreso del día N — {hecho/pendiente}`
   - Body: qué se hizo, qué quedó pendiente, link al commit/deploy

2. **Bloqueantes** (cuando los haya):
   - Subject: `[Cerebro] URGENTE – Necesito X`
   - Body: qué necesito, por qué, cómo lo resuelves desde iPhone

3. **Resumen semanal** (domingo a las 6 pm):
   - Subject: `[Cerebro] Resumen semana N — {milestones}`
   - Body: qué se completó esta semana, qué viene la próxima

---

## Cómo leer el progreso desde vacaciones

Desde el iPhone, Kike puede:
1. Abrir `https://github.com/kikearnedo92/Cerebro/blob/main/docs/DAILY_PROGRESS.md` para ver estado actual
2. Abrir Vercel dashboard (vercel.com/kikearnedo92s-projects/cerebro) para ver deployments
3. Responder a los emails diarios si quiere darme feedback
4. Si quiere darme instrucciones nuevas: abrir Claude app con proyecto Cerebro conectado → "lee docs/HANDOFF.md y el último docs/DAILY_PROGRESS.md, y [nueva instrucción]"
