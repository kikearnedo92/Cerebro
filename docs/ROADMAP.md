# Cerebro — Roadmap 3 meses

**Deploy:** https://cerebro-ivory.vercel.app
**Stack:** React + Vite + Supabase + Vercel + Claude API
**Owner:** Kike (eduardo@retorna.app) · **CTO:** Claude

---

## Visión

Cerebro es el "segundo cerebro" de una empresa. Un chat con IA que conecta las herramientas donde vive el conocimiento (Notion, Slack, Drive, Gmail, Calendar) y responde con la información real de la organización. Target: PYMEs 10–50 empleados.

**North Star metric:** # de mensajes útiles por tenant por semana.

---

## Objetivos 3 meses

**Producto:** MVP vendible y usable a 10/10. Auth completa, 5 integraciones OAuth reales, super-admin funcional, limits, Stripe.

**Negocio:** 10 clientes pagando ($499/mes total = ~$5k MRR si todos Starter). Primeros testimonios, primeros caso de uso público.

**Equipo:** sigue siendo Kike + Claude. Solo freelance puntual si absolutamente necesario.

---

## Milestones semanales

### 📅 Semana 1 (19–25 abril) — PRE-VACACIONES

Estado: **en ejecución hoy 2026-04-19.**

**Claude (en esta sesión):**
- [x] Fix UX del chat (input anclado, autofocus, tipo Claude)
- [x] Migración SQL multi-tenant (tenant_invitations, usage_counters, RLS fix, OAuth columns)
- [x] Helpers backend: crypto AES-256-GCM, supabase auth client
- [x] Docs completos del proyecto en `docs/`

**Kike (antes de irse):**
- [ ] Generar GitHub PAT y entregarlo a Claude
- [ ] Ejecutar migración SQL en Supabase SQL Editor
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` + `TOKEN_ENCRYPTION_KEY` en Vercel
- [ ] Crear Notion OAuth app + entregar `NOTION_CLIENT_ID/SECRET`

Gate para Semana 2: los 4 items de Kike completados.

---

### 📅 Semana 2 (26 abril – 2 mayo)

**Foco:** autenticación end-to-end + Notion OAuth completo.

**Claude:**
- Implementar endpoints `/api/integrations/notion/authorize.js` y `/callback.js`
- Cifrar tokens en DB (AES-256-GCM)
- Sync inicial de Notion: descarga páginas + embeddings + inserta en `knowledge_base` con `source_type='notion'`
- Flows de auth que faltan:
  - Forgot password (`/auth/forgot`) → Supabase send magic link
  - Reset password (`/auth/reset?token=...`)
  - Verify email page post-confirm (mensaje claro + CTA "Ir a Cerebro")
  - Signup con `invitation_token` query param pre-asocia al tenant
- UI de `/app/integrations`: estado real (connected/disconnected/syncing/error), botones funcionales

**QA esperado (Bloque B + C + D1 del QA_CHECKLIST):** chat con contexto de Notion respondiendo correctamente.

---

### 📅 Semana 3 (3–9 mayo)

**Foco:** super-admin + tenant admin.

**Claude:**
- Página `/admin` para super-admin (solo Kike):
  - Lista de tenants con filtros (activos, inactivos, plan, último uso)
  - CRUD de tenants: crear manualmente, editar nombre, pausar/reactivar, cambiar plan, cambiar max_users, cambiar max_monthly_queries
  - Ver usuarios por tenant, ver usage actual
  - Impersonation (entrar como tenant admin para soportar)
- Página `/app/users` (tenant admin de cada cliente):
  - Lista de usuarios del tenant
  - Invitar usuario por email (crea `tenant_invitations` + manda correo con link `/auth?invitation=token`)
  - Cambiar rol (member ↔ admin)
  - Desactivar usuario
- Email templates bonitos (invitación, confirmación, forgot password)

---

### 📅 Semana 4 (10–16 mayo)

**Foco:** Google OAuth (Drive + Gmail + Calendar) + limits.

**Claude:**
- Endpoint genérico `/api/integrations/google/authorize.js` y `/callback.js` con scopes combinados
- Sync logic por provider:
  - Drive: descarga archivos (docs, sheets, pdfs) → extrae texto → indexa
  - Gmail: últimos 500 hilos, solo asunto+primer mensaje → indexa
  - Calendar: próximas 2 semanas → indexa
- Limit enforcement en `/api/chat`: antes de llamar a Claude, check `tenant_over_query_limit()`. Si true → respuesta "alcanzaste tu límite, upgrade"
- UI de usage en `/app/settings` (tu tenant consumió X/Y queries este mes)

**Gate MVP vendible:** al final de semana 4, producto debería permitir:
1. Signup → chat funcional en < 3 min
2. Conectar Notion → Drive → Gmail (al menos 2 de 3)
3. Super-admin ve todos los tenants desde `/admin`
4. Tenant admin invita usuarios

---

### 📅 Semana 5 (17–23 mayo)

**Foco:** Slack OAuth + onboarding.

**Claude:**
- Slack OAuth + sync de canales públicos
- Onboarding guiado post-signup (3 pasos):
  1. Bienvenida + crea 1 doc o conecta 1 integración
  2. Haz tu primera pregunta
  3. Invita a un compañero
- Tour interactivo de la UI primera vez
- Landing page update con testimonios (cuando haya) + copy mejorado

---

### 📅 Semana 6 (24–30 mayo)

**Foco:** Stripe (si Kike ya tiene cuenta) + analytics internos.

**Claude:**
- Stripe Checkout + webhooks (según `docs/RUNBOOK.md` sección 4)
- Panel de analytics en `/admin`:
  - MRR, # de tenants activos, churn
  - Top features usados
  - Errores de sync por tenant
- Notifications in-app (nueva integración conectada, doc indexado, etc.)

---

### 📅 Semana 7–8 (31 mayo – 13 junio)

**Foco:** pulir + conseguir primeros 5 clientes (ventas manuales).

**Claude:**
- Fix bugs reportados por los primeros users
- Mejorar respuestas del chat (prompt engineering, citation format)
- Sync automático background con Vercel cron (cada 6h por tenant)
- Performance: caching de queries repetidas, lazy load de conversaciones

**Kike (negocio):** ejecutar primeras 50 outreach manuales (ver SALES_STRATEGY.md).

---

### 📅 Semana 9–10 (14–27 junio)

**Foco:** primeras ventas + iteración producto.

**Claude:**
- Branding por tenant: subir logo, elegir color primario, aparece en sidebar
- Export conversaciones a PDF/Markdown
- Historial de chat compartible entre miembros del tenant (opcional)
- Dashboard tenant-facing: "tu organización hizo 234 preguntas este mes, top 5 temas: X, Y, Z"

**Kike:** cerrar primeros 3–5 clientes.

---

### 📅 Semana 11–12 (28 junio – 11 julio)

**Foco:** cerrar 10 clientes + preparar escala.

- Caso de estudio público del cliente 1
- Sistema de referidos (cliente invita → descuento para ambos)
- Blog post técnico en Medium/Dev.to (cómo construimos Cerebro con Claude + Supabase)
- Landing page 2.0 con testimonios reales

---

## Métricas para validar en cada milestone

| Semana | Métrica clave | Target |
|---|---|---|
| 1 | Checklist pre-vacaciones completo | 100% |
| 2 | Notion sync funcional + auth flows | Chat cita fuentes de Notion |
| 3 | Super-admin ve todos los tenants | Kike invita 3 test users OK |
| 4 | Limits enforcement + Google OAuth | Sin queries que superen plan |
| 5–6 | Onboarding + Stripe (si aplica) | 3 users completan onboarding |
| 7–8 | Primeros 50 outreach manuales | 5 demos agendadas |
| 9–10 | Primeras ventas | 3–5 clientes pagando |
| 11–12 | Cierre MVP comercial | 10 clientes pagando |

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Kike no entrega PAT → Claude no avanza | Pre-vacaciones: entregar PAT de 90 días |
| Google OAuth pide verificación | Arrancar modo "testing" (100 users max, sin verificación) |
| Costos de Claude API explotan | Rate limiting por tenant + caching queries frecuentes |
| Ningún cliente paga en mes 3 | Pivot a modelo freemium con límites más generosos |
| Competencia (Glean, Slack AI) | Diferenciación = precio + onboarding simple + nicho PYME |

---

## Links rápidos

- [Arquitectura técnica](./ARCHITECTURE.md)
- [QA Checklist manual](./QA_CHECKLIST.md)
- [Runbook de setup externo](./RUNBOOK.md)
- [Flujos de autenticación](./AUTH_FLOWS.md)
- [Spec de Super Admin](./SUPER_ADMIN_SPEC.md)
- [Estrategia de ventas](./SALES_STRATEGY.md)
- [Pendientes de Kike](./PENDING_FROM_KIKE.md)
- [Handoff para Claude futuro](./HANDOFF.md)
