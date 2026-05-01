# CLAUDE.md — Contexto para Claude Code trabajando en Cerebro

> Este archivo lo lee Claude Code automáticamente al abrir el proyecto. Es la **fuente de verdad operativa**: tesis, reglas, prioridades, lo que sí y lo que no se hace hoy.
>
> Última revisión mayor: **2026-04-29 — Reset estratégico tras YC RFS Summer 2026**.

---

## Quién es el founder

**Kike** (Eduardo Arnedo) — `eduardoarnedog@gmail.com` (personal), WhatsApp +56 9 9307 9285.

- No es desarrollador. Tú manejas todo lo técnico.
- Head de Customer Success en Retorna (fintech). **Cerebro es su startup personal, 100% separado de Retorna.**
- Comunicación: respuestas breves, claras, directas. NO párrafos largos. Pregunta antes de armar planes extensos.
- Canal async: email a `eduardoarnedog@gmail.com`. Subject: `[Cerebro] {urgencia} – {resumen}`.

## Tesis del producto (revisada 2026-04-29)

**Cerebro es la capa de contexto operacional de la empresa, para humanos Y agentes IA.**

Un solo producto, dos narrativas según madurez del cliente:

- **Empresa SIN IA implementada:** "Cerebro mantiene viva la memoria operativa de tu empresa. Tu equipo deja de empezar desde cero cada vez que entra alguien nuevo o cuando alguien se va."
- **Empresa CON IA implementada:** "Cerebro es la capa de contexto que tus agentes consultan antes de responder. Reduce alucinaciones, mejora grounding."

**Validación externa:** Y Combinator Request for Startups Summer 2026 (publicado 28 abr 2026) describe textualmente esta categoría: *"Every company has critical know-how scattered across people's heads, old Slack threads, support tickets, and databases, and AI agents can't operate like that. We think every company in the world is going to need a new primitive: a living map of how the company works that turns its own artifacts into an executable skills file for AI."*

Implicación: en jul–sep 2026 esperamos 15–30 startups YC con $500K cada una en esta categoría. **Velocidad importa. Diferenciación importa más.**

## Target

Empresas tech-forward de **50–200 empleados** en LATAM y Europa hispana.

Pricing en revisión: Starter $49 / Growth $99 / Enterprise custom (puede subir a $99 / $299 / $999 si discovery confirma wedge B con agentes IA).

## Las dos hipótesis de comprador

| | Comprador A — humano | Comprador B — agentes IA |
|---|---|---|
| ICP | Head of Ops, CS, Chief of Staff, COO | Head of AI, CTO, VP Eng, líder de automatización |
| Dolor | Onboarding lento, conocimiento que se va, decisiones que se reabren | Agentes que alucinan, cada agente reconstruye contexto, no hay capa común |
| Disposición a pagar | Media (dolor crónico) | Alta (dolor agudo y reciente) |
| Pricing | $99–299/mes | $499–1,999/mes + uso por API call |

**Decisión del wedge: abierta. Validar con 8 entrevistas de discovery.** No comprometerse antes. Ver `docs/DISCOVERY.md` para tabla de decisión post-entrevistas.

---

## 🛑 Reglas no-negociables para Claude Code

### 1. NO construir features nuevos hasta que Kike confirme wedge

Hasta que haya 8 entrevistas y un wedge decidido (~22 jun 2026), **no se construye más producto nuevo**. El MVP actual queda en producción funcional como está.

**Lo que SÍ está permitido durante este período:**
- Bug fixes en lo ya construido (chat, super-admin, Notion sync)
- Mejoras de estabilidad y performance
- Documentación
- Construcción de los **3 agentes IA del equipo** (Code Reviewer, UX/UI Reviewer, Product Strategist) — ver `docs/SYSTEM_PROMPTS.md`
- Restauración tras incidentes (repo, credenciales, deploys)
- Smoke tests y health checks

**Lo que NO está permitido (escalar a Kike por email primero):**
- Nuevos endpoints/features
- Migraciones de schema que cambien semántica
- Integraciones nuevas (Google, Slack, Stripe…)
- Cambios de pricing en código
- Refactors grandes "porque sí"

### 2. NO mezclar Cerebro con Retorna

Cerebro es la startup personal de Kike. Retorna es su trabajo. Nunca:
- Buscar info de Cerebro en el Notion de Retorna
- Marcar `eduardo@retorna.app` o `earnedo@retorna.app` como super_admin
- Mencionar Retorna en código, copy, branding o docs públicos

Solo `eduardoarnedog@gmail.com` es super_admin.

### 3. Seguridad

- Tokens OAuth siempre cifrados con AES-256-GCM antes de guardarse en DB
- Service role key NUNCA al frontend — solo en `/api/*`
- RLS estricta en todas las tablas con `tenant_uuid`
- Cualquier query que toque cross-tenant → super_admin gate explícito vía `is_super_admin()` helper

### 4. Comunicación honesta con Kike

- Si algo falla, decirlo. No inventar.
- Si una propuesta tiene riesgo, listarlo.
- Si una credencial falta, pedírsela. Nunca inventar valores.
- Si una decisión necesita su input → email + parar, no improvisar.

---

## Stack y arquitectura

- Frontend: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- Auth/DB: Supabase (auth + Postgres con pgvector + RLS estricta)
- Backend: Vercel Serverless Functions en `/api/*`
- LLM: Claude (Anthropic) vía `/api/chat.js` — modelo actual `claude-sonnet-4-6`
- Hosting: Vercel auto-deploy desde `main`
- **Cap actual: 12 funciones serverless (Hobby plan).** Cualquier endpoint nuevo requiere consolidar handlers o upgrade a Pro.

Ver `docs/ARCHITECTURE.md` para schema DB completo, flujos OAuth y modelo multi-tenant.

## URLs y proyectos

- Repo: `github.com/kikearnedo92/Cerebro`
- Producción: `https://cerebro-ivory.vercel.app`
- Dashboard Vercel: `vercel.com/kikearnedo92s-projects/cerebro`
- Dashboard Supabase: `supabase.com/dashboard/project/begnklspqjxwkvwhuefr`
- Dominio futuro: `usacerebro.com` (no comprado)

## Credenciales locales

`~/.cerebro/credentials.env` (chmod 600). Si está perdido, el founder regenera con valores de su 1Password o pidiendo a Claude (Cowork) que las dicte desde memoria persistente. Variables actuales:

```
GITHUB_PAT, VERCEL_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
ANTHROPIC_API_KEY, TOKEN_ENCRYPTION_KEY, MIGRATE_SECRET,
NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, INTERNAL_SYNC_TOKEN
```

## Estado del MVP (2026-04-30)

**Funciona en producción:**
- Landing + auth (signup/login/email confirm)
- Multi-tenant schema con RLS, helpers `is_super_admin/get_user_tenant/is_tenant_admin`
- Chat con Claude + RAG sobre Notion (16 items reales del workspace de Kike, citas funcionan)
- Notion OAuth + sync (pages + databases + database_rows + properties + tombstoning)
- Super-admin UI `/admin` con CRUD de tenants, pause/reactivar, summary de MRR/users/docs
- `/api/admin/migrate` para migraciones autónomas
- `/api/cron/daily` para sync, healthcheck, migraciones cada 24h

**Pausado hasta wedge confirmado:**
- Google OAuth (Drive + Gmail + Calendar)
- Slack OAuth
- Embeddings vectoriales (text-search funciona suficiente para MVP)
- Stripe Checkout + webhook
- Onboarding guiado post-signup
- Forgot password / reset / verify pages dedicadas
- Limit enforcement por plan
- API pública para agentes IA + MCP server (solo si wedge B se confirma)

## Las 4 etapas del proyecto

| Etapa | Cuándo | Objetivo |
|---|---|---|
| 0 — Pre-MVP funcional | hoy → 1 jun | Producto en prod + 4 entrevistas iniciadas + bloqueantes resueltos |
| 1 — MVP + Discovery activo | 1 jun → 15 jul | 8+ entrevistas, wedge decidido, 2-3 design partners pagando |
| 2 — Pre-launch | 15 jul → 1 sep | Producto pulido, estrategia de launch, lista 100+ leads |
| 3 — Post-launch | 1 sep → | 10+ clientes, $3K+ MRR, decisión bootstrap vs YC W2027 |

---

## Equipo de agentes IA

Construir los 3 agentes de Etapa 0 según `docs/SYSTEM_PROMPTS.md`:

1. **Code Reviewer Agent** — revisa cada PR antes de merge (GitHub Action)
2. **UX/UI Reviewer Agent (Nivel 1)** — revisa interfaz tras cada deploy
3. **Product Strategist Agent** — mantiene docs estratégicos vivos, briefings semanales

Cuando se completen las 8 entrevistas, agregar:

4. **Discovery Analyst Agent** — analiza el sheet `cerebro-discovery-tracker.xlsx`

## Workflow estándar de feature/fix

1. Kike define la necesidad (en checkpoint quincenal con Claude Cowork o Strategist Agent)
2. Tú (Claude Code) creas branch
3. Implementas + commits incrementales
4. Abres PR a `main`
5. Code Reviewer Agent comenta automáticamente
6. Tú ajustas según review
7. Kike aprueba el merge (o tú haces auto-merge si Code Reviewer aprueba sin findings críticos)
8. Vercel auto-deploya
9. UX/UI Reviewer evalúa la nueva UI tras deploy
10. Strategist Agent registra el cambio en `CHANGELOG.md`

---

## Si te pierdes

Lee en orden: `docs/HANDOFF.md` → este archivo (`CLAUDE.md`) → `docs/DISCOVERY.md` → `docs/USE_CASES.md` → `CHANGELOG.md`. Después decide.

Si después de leer eso seguís sin entender qué hacer: para y mandá email a Kike.
