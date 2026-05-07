# Cerebro · Agentes IA internos

> Cerebro corre con un equipo de agentes IA que automatizan code review,
> standups, research, customer feedback, marketing y compliance. Cada uno
> es un script o edge function que llama a Claude con un prompt dedicado.

Última actualización: 2026-05-07

---

## 🤖 Code Reviewer Agent

**Trigger:** cada PR a `main`
**Workflow:** `.github/workflows/code-reviewer-agent.yml`
**Script:** corre Claude con un prompt de senior engineer reviewer

**Qué hace:**
- Lee el diff del PR
- Identifica bugs críticos, problemas de seguridad, code smells
- Comenta en el PR con findings clasificados (🔴 crítico / ⚠️ importante / 💡 sugerencia)
- Sugiere fixes concretos con ejemplos de código

**Cuándo se usa:** automáticamente. Memo (Claude trabajando vía Cowork)
también puede invocarlo manualmente.

---

## 📅 Daily Standup Agent

**Trigger:** cron 8 AM Chile diario
**Workflow:** `.github/workflows/daily-standup.yml`
**Script:** `scripts/daily-standup.mjs`
**Output:** `docs/standup/YYYY-MM-DD.md` (auto-commit)

**Qué hace:**
- Lee últimos commits, PRs, issues, errores de Vercel/Supabase
- Genera un briefing de 1 página con:
  - Qué se hizo ayer
  - Qué se rompió y se arregló
  - Bloqueos actuales
  - Top 3 prioridades para hoy
- Te pingueas en email/Slack si hay algo crítico

---

## 📊 Research Agent

**Trigger:** cron Domingo 8 PM Chile
**Workflow:** `.github/workflows/research-agent.yml`
**Script:** `scripts/research-agent.mjs`
**Output:** `docs/research/YYYY-MM-DD.md`

**Qué hace:**
- Investiga 4 ejes con `web_search` de Anthropic:
  1. Movimientos de competidores (Glean, Notion AI, MS Copilot, Coworker, etc.)
  2. Trending topics en B2B / RAG / agentes IA
  3. Pain points públicos en Reddit / X / HN
  4. Stats nuevos del mercado (TAM, deals, fundraising)
- Auto-commit del briefing al repo
- Lo lees lunes 8 AM con tu café

---

## 📨 Customer Feedback Agent

**Trigger:** cron 9 AM Chile diario
**Workflow:** `.github/workflows/customer-feedback-agent.yml`
**Script:** `scripts/customer-feedback-agent.mjs`
**Output:** `docs/feedback/YYYY-MM-DD.md`

**Qué hace:**
- Lee `public.waitlist` desde Supabase (últimas 24h)
- Para cada signup, llama a Claude con su info y le pide:
  - `icp_fit`: high / medium / low
  - `priority_score`: 0-10
  - `reasoning`: 2 oraciones
  - `response_draft`: borrador de email de bienvenida personalizado
- Genera un digest markdown ordenado por priority
- Auto-commit a `docs/feedback/`

**Resultado:** abres el digest cada mañana, copias los borradores high-fit,
los pegas en tu email y respondes en 5 min lo que tomaría 30.

---

## 🧠 Product Strategist Agent

**Trigger:** cron Lunes 9 AM Chile
**Workflow:** `.github/workflows/strategist-briefing.yml`
**Output:** `docs/strategist/YYYY-MM-DD.md`

**Qué hace:**
- Cruza data del Research Agent + Customer Feedback Agent + métricas internas
- Propone:
  - Ajustes de prioridad del roadmap
  - Hipótesis de pricing para validar
  - Riesgos y oportunidades de la semana
- Te avisa si algún experimento se debería matar

---

## 📈 Growth Agent (NUEVO Sprint 4)

**Trigger:** cron Lunes 7 AM Chile
**Workflow:** `.github/workflows/growth-agent.yml`
**Script:** `scripts/growth-agent.mjs`
**Output:** `docs/growth/YYYY-MM-DD-week.md`

**Qué hace:**
- Genera 5 slideshows faceless TikTok/LinkedIn de la semana siguiendo el
  framework `docs/MARKETING_FACELESS_STRATEGY.md`
- Cada slideshow incluye:
  - Hook (3 seg)
  - Body (3-5 slides con texto + visual hint)
  - CTA con UTM apropiado
- Te dice qué slideshow postear cada día (mar-vie + lun)

---

## ⚖️ Compliance / Legal Agent (NUEVO Sprint 4)

**Trigger:** cron Miércoles 10 AM Chile
**Workflow:** `.github/workflows/compliance-agent.yml`
**Script:** `scripts/compliance-agent.mjs`
**Output:** `docs/compliance/YYYY-MM-DD.md`

**Qué hace:**
- Investiga cambios regulatorios relevantes con web_search:
  - Ley 19.628 Chile (Protección de Vida Privada)
  - GDPR (UE)
  - LGPD (Brasil)
  - SII Chile (facturación electrónica)
- Detecta cambios en TOS de Anthropic, Voyage, Supabase, Vercel
- Sugiere updates a `/privacy` y `/terms` cuando aplica
- Te alerta si Cerebro está expuesto a algún riesgo legal nuevo

---

## 🎨 UX Reviewer Agent (REACTIVADO Sprint 4)

**Trigger:** cron Jueves 6 PM Chile
**Workflow:** `.github/workflows/ux-reviewer-agent.yml`
**Script:** `scripts/ux-reviewer-agent.mjs`
**Output:** `docs/ux/YYYY-MM-DD.md`

**Qué hace:**
- Toma screenshots de páginas clave (`/`, `/app/chat`, `/app/integrations`,
  `/app/usage`, `/waitlist`) en desktop + mobile
- Las pasa a Claude con un prompt de senior product designer
- Identifica issues de UX/UI:
  - Jerarquía visual confusa
  - CTAs débiles
  - Microcopy mejorable
  - Inconsistencias de spacing
  - Accesibilidad (contraste, aria-labels)
- Propone fixes concretos con código

---

## ⚙️ Drive Sync Worker

**Trigger:** cron cada 1 minuto
**Workflow:** `.github/workflows/drive-sync-worker.yml`
**Edge function:** `supabase/functions/drive-sync-worker/index.ts`

**Qué hace:**
- Toma 5 archivos `pending` de `drive_sync_queue`
- Descarga + parsea (mammoth/xlsx/unpdf/jszip lazy-loaded)
- Inserta/actualiza en `knowledge_base`
- Marca `done` o `error` según resultado

---

## 🧬 Embed Worker

**Trigger:** cron cada 5 minutos
**Workflow:** `.github/workflows/embed-worker.yml`
**Edge function:** `supabase/functions/embed-worker/index.ts`

**Qué hace:**
- Toma 20 rows de `knowledge_base` con `embedding IS NULL`
- Genera embeddings con Voyage AI `voyage-3-large`
- Guarda en columna `embedding vector(1024)`

---

## Roadmap de agentes futuros

| Agente | Sprint | Status |
|---|---|---|
| Code Reviewer | 1 | ✅ |
| Daily Standup | 2 | ✅ |
| Research | 2 | ✅ |
| Customer Feedback | 3 | ✅ |
| Product Strategist | 1 | ✅ |
| Growth | 4 | 🚧 (en construcción) |
| Compliance | 4 | 🚧 (en construcción) |
| UX Reviewer | 4 | 🚧 (reactivar) |
| **Sales Agent** | 5 | 📅 (responder leads en LinkedIn auto) |
| **Discovery Analyst** | 5 | 📅 (analiza entrevistas, sugiere preguntas) |
| **Onboarding Coach** | 6 | 📅 (DM cliente nuevo días 1, 3, 7, 14) |
| **Pricing Optimizer** | 7 | 📅 (A/B testing de tiers) |

## Cómo agregar un agente nuevo

1. Crear `scripts/<nombre>-agent.mjs` con la lógica
2. Crear `.github/workflows/<nombre>-agent.yml` con el cron
3. Agregar entrada a este `AGENTS.md`
4. Asegurar secrets que use estén en GitHub repo secrets
5. Trigger manual primer run para validar
6. Code Reviewer Agent revisa el PR del nuevo agente

---

_Equipo de agentes mantenido por Memo. Kike define qué agentes faltan y para qué._
