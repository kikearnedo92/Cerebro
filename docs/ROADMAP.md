# Cerebro · Roadmap

> Sprints planificados. Cada sprint = ~1-2 semanas de trabajo concentrado.
> Última actualización: 2026-05-07

---

## ✅ Sprint 1 (2026-04-29 → 2026-05-04) — Foundation

- Auth, multi-tenant, RLS estricta
- Chat con Claude + RAG sobre Notion
- Notion OAuth + sync recursivo
- Super-admin UI con CRUD de tenants
- `/api/admin/migrate` autónomas
- Cron daily para healthcheck

## ✅ Sprint 2 (2026-05-05 → 2026-05-06) — Wedge + Marketing

- Drive integration con background queue + worker
- Onboarding Checklist en chat
- Comparativa de competidores en landing
- Waitlist landing con UTM tracking
- **MCP Server (wedge YC RFS S26)** con 3 tools
- Pricing dual model (suscripción + transaccional)
- Customer Feedback Agent (cron diario)
- TikTok/Reels faceless marketing strategy
- Embeddings vectoriales con pgvector + Voyage AI
- Slack integration via Edge Function
- Dashboard de uso interno

## 🚧 Sprint 3 (2026-05-07) — Legal + Polish

- ✅ Privacy Policy + Terms of Service + DPA + Cookie banner
- ✅ README v2 + Master Brief v2
- 🔄 Growth Agent (semana 1 calendario social)
- 🔄 Compliance/Legal Agent
- 🔄 UX Reviewer Agent reactivar
- 🔄 Fix bug Drive sync 425/427 mostrando 100%
- 🔄 Gmail integration
- 🔄 Security audit + checklist

## 📅 Sprint 4 (próxima semana, ~2026-05-08 → 2026-05-15) — Activación comercial

**Objetivo:** llegar a $300 MRR (3 clientes pagando piloto).

| Item | Effort | Owner |
|---|---|---|
| Email outreach al suegro + 2 contactos LinkedIn | 1h | Kike |
| Publicar 5 slideshows TikTok/LinkedIn (output del Growth Agent) | 2h/semana | Kike |
| Activar Customer Feedback Agent → revisar digest diario | 5min/día | Kike |
| Onboarding flow post-signup mejorado (video tour) | 4h | Memo |
| Limit enforcement por plan (queries/mes con cap) | 3h | Memo |
| Email transactional templates (welcome, paywall, etc) | 2h | Memo |
| Crear cuentas TikTok + LinkedIn empresariales | 30min | Kike |

## 📅 Sprint 5 (~2026-05-15 → 2026-05-22) — Monetización

**Objetivo:** Stripe Atlas en proceso + 5 clientes pagando.

| Item | Effort | Owner |
|---|---|---|
| Stripe Atlas application | 2h | Kike (con guía Memo) |
| Stripe Checkout integration (test mode) | 4h | Memo |
| Webhook subscription sync (test) | 3h | Memo |
| Billing page en `/app/billing` | 3h | Memo |
| GitHub integration | 4h | Memo |
| Agent builder visual MVP (drag-drop) | 8h | Memo |
| Caso de éxito #1 (testimonial del suegro mes 1) | 1h | Kike |

## 📅 Sprint 6 (~2026-05-22 → 2026-06-05) — Escala

**Objetivo:** $1,500 MRR (10 clientes). Decisión bootstrap vs YC W2027.

| Item | Effort | Owner |
|---|---|---|
| Stripe live mode + migrar manual a auto | 2h | Memo |
| Embeddings on hot path (re-embed automático on doc change) | 4h | Memo |
| Multi-language en UI (EN, PT) | 4h | Memo |
| API pública v1 + docs | 6h | Memo |
| Workspace sharing / team invites mejorado | 4h | Memo |
| LinkedIn ads paid (USD 100 piloto) | 1h setup | Kike |
| YC W2027 application si aplica | 4h | Kike + Memo |

## 🔮 Backlog (Sprint 7+)

### Producto
- BYOC / self-hosted tier
- SOC2 Type 1 certificación
- Embeddings híbridos (Opción C: solo metadata + embeddings, no raw content)
- Visual agent builder (laburen-style)
- Mobile app (React Native con shared logic)
- Slack bot dentro del workspace del cliente
- WhatsApp Business integration
- Audio/video transcripción automática

### Crecimiento
- Programa de partners (consultoras IT chilenas)
- Marketplace de plantillas de agentes
- Affiliate program
- Eventos / webinars mensuales
- Newsletter con casos de éxito

### Operativo
- Soporte 24/7 con agente de chat (Cerebro mismo)
- Health monitoring de uso por cliente con alertas
- A/B testing framework para landing
- Customer health score por tenant

### Geografía
- Lanzamiento Brasil (PT-BR)
- Lanzamiento España (peninsular)
- Lanzamiento México (especialmente fintech)

---

## Cómo se prioriza

Métrica norte: **MRR** ($/mes recurrente).

Toda feature se evalúa con 4 preguntas:
1. ¿Mueve directamente la aguja del MRR? (sí = priorizar)
2. ¿Ayuda a cerrar el siguiente cliente piloto? (sí = priorizar)
3. ¿Reduce churn de clientes existentes? (sí = priorizar)
4. ¿Es bloqueador legal/security? (sí = priorizar de inmediato)

Si la respuesta a las 4 es no, se va al backlog.

---

_Mantenido por Memo. Kike revisa al inicio de cada sprint y decide si reordena._
