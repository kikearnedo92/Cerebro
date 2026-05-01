# CHANGELOG

> Decisiones grandes con fecha y razón. Mantenido por el Product Strategist Agent (cuando esté operativo) o por el founder/Claude actual.

---

## 2026-04-30 · Clarificación tesis dual — diferencial vs YC RFS S26

### Contexto

Tras analizar la transcripción exacta del video YC RFS S26 ("We need something like Gary's G-Brain, but for every business in the world… executable skills file for AI agents"), se evidencia que YC posiciona el "company brain" **solo para agentes IA**. Cerebro estaba escribiendo en docs como si tuviera que elegir wedge A (humano) o B (agente IA) post-discovery.

### Decisión

**Wedge dual desde día 1.** Cerebro sirve humanos Y agentes IA simultáneamente con un solo producto. Discovery NO decide A vs B — decide el ÁNGULO de pitch según el lead.

### Trade-offs aceptados

- Mensaje un poco más complejo de explicar en 30 segundos. Mitigación: pitch adaptado al ICP del lead.
- Mayor superficie técnica (chat UI + API/MCP). Aceptable: el chat ya existe, MCP server no es trabajo masivo.
- Menos foco aparente. Mitigación: discovery valida si las empresas QUIEREN un solo sistema dual o prefieren dos separados.

### Cambios concretos

- `CLAUDE.md` — sección "wedge dual" reemplaza "decidir A vs B"
- `docs/USE_CASES.md` — cada caso sirve a humanos Y agentes; agregados los 3 ejemplos canónicos del video YC (refunds, pricing exceptions, incident response)
- Próximo: `docs/DISCOVERY.md` — script ajustado para detectar ángulo, no clasificar comprador

---

## 2026-04-29 · Reset estratégico tras YC RFS Summer 2026

### Contexto

El 28 abril 2026, Y Combinator publicó su Request for Startups Summer 2026 con un video que describe textualmente la categoría que Cerebro estaba construyendo:

> *"Every company has critical know-how scattered across people's heads, old Slack threads, support tickets, and databases, and AI agents can't operate like that. We think every company in the world is going to need a new primitive: a living map of how the company works that turns its own artifacts into an executable skills file for AI."*

Hasta ese momento Cerebro venía siendo descrito como "el segundo cerebro de tu empresa" con foco en PYMEs 10–50 personas y precios $49–99. Tras el video YC + research de mercado del 29 abr, quedó claro que la categoría tiene dos hipótesis de comprador con economía muy distinta.

### Opciones evaluadas

1. **Mantener tesis original** (segundo cerebro humano, $49-99) — riesgo: 15-30 startups YC en jul-sep van por la versión IA con $500K cada una. Difícil de defender.
2. **Pivote completo a wedge B (agentes IA)** — riesgo: abandonar dolor humano que sí está validado en research, y que es más barato de empezar.
3. **Tesis dual + discovery decide** — costo: 8 entrevistas y 6 semanas. Beneficio: data, no opinión.

### Decisión

**Tesis dual + discovery decide (opción 3).**

Cerebro se redefine como *"la capa de contexto operacional de la empresa, para humanos Y agentes IA."* Un solo producto, dos narrativas según madurez del cliente. El wedge inicial (A vs B) se decide tras 8 entrevistas — no antes. Tabla de decisión en `docs/DISCOVERY.md`.

### Trade-offs aceptados

- 6 semanas sin construir features nuevos. El MVP actual queda en producción funcional como está.
- Ventana de diferenciación competitiva se acorta por la avalancha YC esperada en jul-sep.
- Costo de oportunidad: cero ingresos hasta confirmar wedge.
- Aceptamos que las 4 etapas del proyecto se pueden mover si discovery sorprende.

### Métricas para evaluar éxito en 3 meses (1 ago 2026)

- ✅ 8+ entrevistas completadas con score formal
- ✅ Wedge inicial decidido con data, no opinión
- ✅ 2-3 design partners pagando ($300-1,500 MRR mínimo)
- ✅ Producto del MVP no degradado (uptime, latencias, accuracy de RAG)

### Cambios concretos en este commit

- README reescrito (eliminado el genérico de Lovable)
- CLAUDE.md reescrito con tesis nueva + reglas no-negociables (no features hasta wedge)
- `docs/DISCOVERY.md` nuevo con script de 25 min, reglas, scoring, métricas semanales
- `docs/USE_CASES.md` nuevo con los 14 casos mapeados
- `docs/SYSTEM_PROMPTS.md` nuevo con system prompts del equipo de agentes IA
- `docs/HANDOFF.md` actualizado con el pivote
- `lovable-memories/` eliminado (tech debt)

---

## 2026-04-20 · Día 2 — Super-admin UI + Notion RAG validado

Auto-ejecutado por scheduled task durante vacaciones de Kike. Detalle en `docs/DAILY_PROGRESS.md`.

- ✅ `/api/admin/tenants` (single-handler GET/PATCH/POST por cap de 12 funciones Hobby)
- ✅ `/admin` UI con tabla real de tenants, pausa/reactivar, summary
- ✅ Día 1 Notion validado E2E: 16 items indexados, chat cita 4 fuentes reales
- 🐛 Fix bug índice parcial (`20260420000001_fix_kb_unique_full.sql`)

Commits: `4f9c619`, `cdc55ef`, `a81092a`.

---

## 2026-04-20 · Día 1 — Notion sync robusto

- Migración `20260420000000_notion_sync_fixes.sql` (unique partial index, metadata JSONB, file_type index)
- `api/integrations/notion/sync.js` reescrito: pages + databases + database_rows + properties + tombstoning
- 2 incidentes Vercel resueltos: cron limit (Hobby = 1/día) y serverless function cap (12)

Commits: `2e86d4c`, `76350fc`, `856cf43`.

---

## 2026-04-19 · Sesión nocturna — Desbloqueo pre-vacaciones

- `~/.cerebro/credentials.env` creado con 10 variables
- `INTERNAL_SYNC_TOKEN` generado y agregado a Vercel
- 38 migraciones marcadas como aplicadas en `_migrations`
- `/api/admin/migrate` operativo (`ok:true`)

---

## 2026-04-19 · Foundation inicial

- Multi-tenant schema (`tenants`, `tenant_invitations`, `usage_counters`, RLS estricta)
- Endpoints OAuth (Notion + Google + Slack code-ready)
- Crypto helper AES-256-GCM
- Vercel Cron + `/api/admin/migrate` + `/api/cron/daily`
- 11 documentos en `docs/` (ROADMAP, HANDOFF, ARCHITECTURE, AUTH_FLOWS, etc.)

Commits: `777d694`, `80d01b5`, `91e58b0`, `8695c18`, `b5cd382`, `fad3971`, `e9a0c91`, `d92375e`.
