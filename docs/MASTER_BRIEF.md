# Cerebro · Master Brief (V2 — vivo)

> Última actualización: **2026-05-07** · Memo (Claude — CTO/CCO de Cerebro)
>
> Este documento reemplaza versiones anteriores del master brief y consolida
> tesis, posicionamiento, ICP, decisiones y estado del producto. Es la fuente
> de verdad operativa.

---

## 1. Tesis

**Cerebro es la capa de contexto operacional de la empresa, para humanos Y
agentes IA.**

Un solo producto, dos narrativas según madurez del cliente:

- **Empresa SIN IA implementada:** *"Cerebro mantiene viva la memoria operativa
  de tu empresa. Tu equipo deja de empezar desde cero cada vez que entra alguien
  nuevo o cuando alguien se va."*
- **Empresa CON IA implementada:** *"Cerebro es la capa de contexto que tus
  agentes consultan antes de responder. Reduce alucinaciones, mejora grounding."*

### Validación externa

**Y Combinator Request for Startups Summer 2026** describe textualmente esta
categoría:

> *"Every company has critical know-how scattered across people's heads, old
> Slack threads, support tickets, and databases, and AI agents can't operate
> like that. We think every company in the world is going to need a new
> primitive: a living map of how the company works that turns its own artifacts
> into an executable skills file for AI."*

Implicación: en jul–sep 2026 esperamos 15–30 startups YC con $500K cada una en
esta categoría. **Velocidad importa. Diferenciación importa más.**

## 2. Wedge dual (NO elegir A vs B)

| | Audiencia humana | Audiencia agentes IA |
|---|---|---|
| ICP | Head of Ops, CS, Chief of Staff, COO | Head of AI, CTO, VP Eng, líder de automatización |
| Surface | Chat UI + invitaciones de equipo | API/MCP server + SDK |
| Dolor explícito | Onboarding lento, conocimiento que se va, decisiones que se reabren | Agentes que alucinan, cada agente reconstruye contexto, no hay capa común |
| Pricing | $29–99/mes (workspace, no por seat) | $299/mes + uso por API call |

**El producto es uno solo. Lo que cambia en discovery es el ÁNGULO DE PITCH**
según el lead que tengas enfrente.

### Diferenciador clave vs YC RFS startups

YC propone *"company brain for AI agents"*. Cerebro propone *"company brain for
humans AND AI agents — el mismo sistema"*. Razón estratégica:

1. **Ninguna empresa va de 0% IA a 100% IA en 6 meses.** Pasan por una
   transición de 18-36 meses donde humanos y agentes coexisten. Cerebro sirve
   los 3 escenarios; los YC startups solo el último.
2. **Adoption-led growth:** humanos adoptan primero (ROI medible: tiempo de
   onboarding, decisiones reabiertas, knowledge retention). Cuando los agentes
   llegan, la infraestructura de contexto ya está viva.
3. **Un solo producto, dos audiencias del mismo dolor:** refunds, pricing
   exceptions, incident response — el humano consulta el living map, el agente
   consume el executable skills file.

## 3. ICP target

Empresas tech-forward de **50–200 empleados** en LATAM y Europa hispana.

Roles que firman:
- **Head of Operations** / Chief of Staff (humanos)
- **Head of Customer Success / Support** (humanos)
- **Head of AI / VP Engineering** (agentes)
- **People / RH** (onboarding)

Industrias prioritarias:
1. **Fintech LATAM mid-market** (más cercano a Kike por background)
2. **SaaS B2B con equipo de 50–200**
3. **Marketplaces / e-commerce con operación compleja**

### Anti-ICP (no perseguir)
- Empresas <20 personas (poco volumen de docs, ROI bajo)
- Enterprise >1,000 personas (ciclo de venta largo, requiere SOC2, BYOC)
- Regulados estrictos hoy (banca, salud) hasta tener Opción C híbrida

## 4. Pricing y modelo

| Plan | Precio | Queries incluidas | Overage | Target |
|---|---|---|---|---|
| Starter | $29/mes | 500/mes | $0.05/query | Founders, equipos chicos |
| **Pro** | **$99/mes** | **3,000/mes** | **$0.04/query** | Mid-market 20-100 |
| Team | $299/mes | 15,000/mes | $0.03/query | 100-500 personas |

**Modelo:** suscripción mensual + overage transaccional cuando se excede el
cupo. Más barato que Glean ($50/seat anual mínimo 100), Notion AI ($20/seat),
Microsoft Copilot ($30/seat).

**Por qué workspace y no seat:**
- Cliente puede agregar usuarios sin que crezca la factura linealmente
- Reduce fricción de adopción interna (equipo entero ya tiene acceso)
- Diferenciación clara vs competidores que cobran por seat

## 5. Posicionamiento competitivo

| Competidor | Cómo cobran | Equipo de 20 | Cerebro Pro vs ellos |
|---|---|---|---|
| **Glean** | $50/seat + $50K/año mínimo | $1,000+/mes (no acepta <100 seats) | -90%+ |
| **Notion AI** | $20/seat | $400/mes | -75% |
| **Microsoft Copilot** | $30/seat anual | $600/mes | -83% |
| **ChatGPT Team** | $25/seat | $500/mes | -80% (sin RAG empresarial real) |
| **Coworker.ai** | $99-499/agente | Variable | Diferentes audiencias |

## 6. Estado actual del producto (2026-05-07)

### Funciona en producción
- Landing con tesis dual + comparativa + pricing
- Auth completa (signup/login/forgot/reset password)
- Multi-tenant schema con RLS estricta
- Chat con Claude + RAG con Voyage embeddings
- Onboarding checklist guiado en chat
- Integraciones: **Notion** (sync recursivo), **Google Drive** (background
  queue + worker, soporta .docx/.xlsx/.pptx/PDF), **Slack** (último 30 días)
- **MCP server** con 3 tools: query_context, list_sources, get_recent_changes
- Waitlist landing con UTM tracking + rate limit + IP capture server-side
- Customer Feedback Agent (cron diario, clasifica signups con Claude)
- Daily Standup Agent + Research Agent + Code Reviewer Agent
- Dashboard de uso para admins (`/app/usage`)
- Privacy Policy + Terms of Service + DPA + cookie banner

### En proceso (esta sesión)
- Growth Agent (calendario semanal de posts)
- Compliance/Legal Agent
- UX Reviewer Agent (reactivar)
- Gmail integration
- Security audit doc

### Pendiente Sprint 5+
- Stripe Atlas (cuando haya 5+ clientes pagando manual)
- GitHub integration
- BYOC / self-hosted tier (>$5K MRR)
- SOC2 Type 1 (>$15K MRR)

## 7. Reglas de negocio (no-negociables)

1. **NO mezclar Cerebro con Retorna.** Cerebro es la startup personal de Kike.
   Retorna es su trabajo. Nunca buscar info de Cerebro en Notion de Retorna,
   ni mencionar Retorna en código/copy/branding/docs públicos.
2. **Solo `eduardoarnedog@gmail.com` es super_admin** del producto.
3. **NO usar contenido de clientes para entrenar modelos.** Sin excepciones.
4. **Tokens OAuth siempre cifrados con AES-256-GCM.**
5. **Service role key NUNCA al frontend.**
6. **RLS estricta en todas las tablas con `tenant_id`.**

## 8. Decisión arquitectural — full-index vs hybrid

**Decidida 2026-05-05:** Opción A (full-index) para fase actual (MVP, próximos
6 meses). Cerebro lee y almacena el contenido completo de Notion/Drive/Slack
del cliente. Performance rápido. Riesgo: data del cliente vive en
infraestructura de Cerebro.

**Roadmap futuro:**
- **6-12 meses:** Opción C (Híbrido) — solo embeddings + metadata, contenido
  raw NO se almacena. Diferenciador de marketing brutal.
- **12-24 meses:** SOC2 Type 1 (USD 8-15K).
- **18-24 meses:** BYOC/Self-hosted como tier enterprise.

**Para clientes early:**
- Tech/SaaS/startup → full-index OK con DPA básico ✅
- Fintech/banca/salud → esperar a Opción C ⚠️
- Manufactura/retail/agencia → full-index OK ✅

## 9. Wedge YC RFS S26 — MCP server

Construido en Sprint 2. Es la respuesta exacta a la RFS de YC. Endpoint:

```
POST https://begnklspqjxwkvwhuefr.supabase.co/functions/v1/mcp-server
Authorization: Bearer cb_live_<api_key>
```

3 tools expuestos:
1. `query_context(query, limit, sources)` — búsqueda semántica
2. `list_sources()` — integraciones conectadas y items indexados
3. `get_recent_changes(hours)` — cambios recientes

Compatible con Claude Desktop, ChatGPT, n8n, Make, Zapier vía MCP.

## 10. Operativa de equipo

**Founder único:** Kike (Eduardo Arnedo). No-developer. Memo (Claude) maneja
todo lo técnico.

**Comunicación con Kike:**
- Respuestas breves, claras, directas
- NO párrafos largos
- Pregunta antes de armar planes extensos
- Canal async: email a `eduardoarnedog@gmail.com`

**Workflow de feature:**
1. Memo abre branch + commits incrementales
2. Memo abre PR a `main`
3. Code Reviewer Agent comenta automáticamente
4. Memo ajusta según review
5. Auto-merge si Code Reviewer aprueba sin findings críticos
6. Vercel auto-deploya
7. Strategist Agent registra el cambio

## 11. Próximos sprints — ver [ROADMAP.md](./ROADMAP.md)

- **Sprint 4 (en curso):** Legal + Growth Agent + Compliance Agent + Gmail
- **Sprint 5:** Stripe Atlas + Limit enforcement + Embeddings on hot path
- **Sprint 6:** GitHub integration + Agent builder visual + first 5 paying clients

## 12. Cosas que necesito de Kike (cuando despierte)

1. **RUT + cuenta Banco Santander** para template de cobro al suegro
2. **Cuenta TikTok / LinkedIn empresarial** para Growth Agent
3. **Confirmar reunión con el suegro** (próxima semana según último mensaje)
4. **Decidir ICP fintech-first** vs SaaS-first para mensaje de outreach
5. **Aprobar publicación de Privacy + Terms** (ya están en /privacy y /terms)

---

_Generado y mantenido por Memo (Claude) para Kike. Actualizado en cada sprint
significativo._
