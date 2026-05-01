# Cerebro

> **La capa de contexto operacional de la empresa, para humanos y agentes IA.**

Cerebro mantiene viva la memoria operativa de tu organización. Conecta Notion, Slack, Drive, Gmail y Calendar y entrega ese conocimiento — vía chat o vía API — tanto a las personas que necesitan recordar cómo se hacen las cosas como a los agentes de IA que necesitan contexto fresco para no alucinar.

## Para quién

Empresas tech-forward de **50–200 empleados** en LATAM y Europa hispana, con dolor en alguna de estas dos formas:

- **Comprador A — humano:** Heads of Operations, CS, Chief of Staff, COO. Onboarding lento, conocimiento que se va con cada renuncia, decisiones que se reabren sin criterio histórico.
- **Comprador B — agentes IA:** Heads of AI, CTO, VP Engineering. Sus agentes alucinan por falta de contexto empresarial; cada agente nuevo reconstruye conocimiento desde cero.

> El wedge inicial (A vs B) se decide tras 8 entrevistas de discovery — no antes. Ver [`docs/DISCOVERY.md`](./docs/DISCOVERY.md).

## Estado (2026-04-30)

- **Producción:** [cerebro-ivory.vercel.app](https://cerebro-ivory.vercel.app)
- **Etapa:** 0 (Pre-MVP funcional → 1 jun 2026)
- **MVP funcional:** auth multi-tenant, chat con Claude + RAG sobre Notion (16 items indexados, citas reales), super-admin UI con CRUD de tenants, runner de migraciones autónomo, Vercel Cron diario.
- **Pausado hasta validar wedge:** Google OAuth, Slack OAuth, embeddings vectoriales, Stripe, onboarding guiado.

## Stack

React 18 + TypeScript + Vite + Tailwind + shadcn/ui · Vercel Serverless Functions · Supabase (Postgres + pgvector + RLS estricta) · Claude API (Anthropic) · Vercel hosting auto-deploy desde `main`.

## Documentación viva

Punto de entrada para cualquier Claude que retome el proyecto: [`docs/HANDOFF.md`](./docs/HANDOFF.md). Después en orden:

- [`CLAUDE.md`](./CLAUDE.md) — instrucciones para todo Claude/agente que toque este repo
- [`docs/DISCOVERY.md`](./docs/DISCOVERY.md) — script de entrevistas + reglas + scoring
- [`docs/USE_CASES.md`](./docs/USE_CASES.md) — los 14 casos de uso mapeados
- [`docs/SYSTEM_PROMPTS.md`](./docs/SYSTEM_PROMPTS.md) — system prompts del equipo de agentes IA
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/AUTH_FLOWS.md`](./docs/AUTH_FLOWS.md), [`docs/SUPER_ADMIN_SPEC.md`](./docs/SUPER_ADMIN_SPEC.md), [`docs/RUNBOOK.md`](./docs/RUNBOOK.md), [`docs/SALES_STRATEGY.md`](./docs/SALES_STRATEGY.md)
- [`CHANGELOG.md`](./CHANGELOG.md) — decisiones grandes con fecha y razón

## Equipo

- **Founder:** Eduardo "Kike" Arnedo · [eduardoarnedog@gmail.com](mailto:eduardoarnedog@gmail.com) · Chile
- **CTO Agent:** Claude Code (Mac local del founder)
- **Code Reviewer Agent + UX/UI Reviewer Agent + Product Strategist Agent:** ver `docs/SYSTEM_PROMPTS.md`

## Licencia

Propietario. © 2026 Eduardo Arnedo.
