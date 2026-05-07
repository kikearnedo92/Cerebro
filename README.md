# Cerebro

> **La capa de contexto operacional para humanos y agentes IA.**
>
> Cerebro indexa el conocimiento disperso de tu empresa (Notion, Drive, Slack,
> Gmail) y lo deja disponible para tu equipo (chat con IA) y para tus agentes
> IA externos (vía MCP server). Un solo producto, dos audiencias del mismo dolor.

🌐 **Producción:** [cerebro-ivory.vercel.app](https://cerebro-ivory.vercel.app)
✉️ **Lista de espera:** [/waitlist](https://cerebro-ivory.vercel.app/waitlist)
📡 **MCP Server:** `https://begnklspqjxwkvwhuefr.supabase.co/functions/v1/mcp-server`

---

## Tesis

Toda empresa tiene know-how crítico repartido en cabezas, hilos viejos de
Slack, tickets, documentos y bases de datos. Los agentes IA no pueden operar
así. Cerebro convierte los artefactos de la empresa en un mapa vivo —
consultable por humanos en lenguaje natural y por agentes IA vía
[Model Context Protocol](https://modelcontextprotocol.io).

Validación: **YC RFS Summer 2026** describe textualmente esta categoría.
Diferenciación de Cerebro: dual desde día uno (humanos + agentes IA) y
mid-market LATAM/España hispanohablante.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui |
| Auth + DB | Supabase (Postgres + pgvector + RLS) |
| Backend | Vercel Serverless Functions (`/api/*`) + Supabase Edge Functions (Deno) |
| LLM | Claude Sonnet 4.6 (Anthropic) |
| Embeddings | Voyage AI `voyage-3-large` (1024 dim, recomendado por Anthropic) |
| MCP server | Edge function JSON-RPC 2.0 con 3 tools |
| Hosting | Vercel auto-deploy desde `main` |
| Crons / Agentes | GitHub Actions |

## Quick start (development)

```bash
git clone https://github.com/kikearnedo92/Cerebro.git
cd Cerebro
npm install
cp .env.example .env.local  # ver variables abajo
npm run dev
```

### Variables de entorno

```
VITE_SUPABASE_URL=https://begnklspqjxwkvwhuefr.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>   # solo backend
ANTHROPIC_API_KEY=<your_anthropic_key>              # solo backend
VOYAGE_API_KEY=<your_voyage_key>                    # solo backend
TOKEN_ENCRYPTION_KEY=<64_hex_chars>                 # AES-256 key
WORKER_AUTH_TOKEN=<random_64_hex>                   # entre Supabase + GitHub Actions
GOOGLE_CLIENT_ID=<from_console.cloud.google.com>
GOOGLE_CLIENT_SECRET=<from_console.cloud.google.com>
SLACK_CLIENT_ID=<from_api.slack.com>
SLACK_CLIENT_SECRET=<from_api.slack.com>
NOTION_CLIENT_ID=<from_developers.notion.com>
NOTION_CLIENT_SECRET=<from_developers.notion.com>
```

## Arquitectura (alto nivel)

```
React (Vercel)
    │
    ├──► /api/chat.js  ──►  Claude (LLM)
    │                          ▲
    └──► Supabase Postgres ◄─── Voyage AI (embeddings)
              ▲   + pgvector
              │   + RLS por tenant
              │
    ┌─────────┴─────────────────────────────────┐
    │  Supabase Edge Functions (Deno)            │
    │  • google-drive-integration                │
    │  • drive-sync-worker (cron)                │
    │  • slack-integration                       │
    │  • notion-integration                      │
    │  • embed-worker (cron)                     │
    │  • mcp-server (JSON-RPC 2.0)               │
    └────────────────────────────────────────────┘
              ▲ via WORKER_AUTH_TOKEN
              │
    ┌─────────┴────────────────────────────────┐
    │  GitHub Actions crons                     │
    │  • drive-sync-worker (cada 1 min)         │
    │  • embed-worker (cada 5 min)              │
    │  • daily-standup (8 AM Chile)             │
    │  • customer-feedback-agent (9 AM Chile)   │
    │  • research-agent (Domingo 8 PM Chile)    │
    │  • code-reviewer-agent (en cada PR)       │
    └───────────────────────────────────────────┘
```

## Agentes IA internos

| Agente | Cron | Output |
|---|---|---|
| **Code Reviewer** | On every PR | Comment con findings críticos/importantes |
| **Daily Standup** | 8 AM Chile diario | `docs/standup/YYYY-MM-DD.md` |
| **Research Agent** | Domingo 20:00 Chile | `docs/research/YYYY-MM-DD.md` (competidores + trends) |
| **Customer Feedback Agent** | 9 AM Chile diario | `docs/feedback/YYYY-MM-DD.md` (waitlist clasificado) |
| **Product Strategist** | Lunes 9 AM Chile | Briefings semanales de producto |

Todos los agentes son scripts Node/Edge functions que llaman a la API de
Claude con prompts dedicados. Ver [docs/AGENTS.md](./docs/AGENTS.md).

## Estructura del repo

```
.
├── api/                       # Vercel serverless functions
│   ├── chat.js                # endpoint principal del chat con RAG
│   ├── integrations/          # OAuth callbacks de Google, Notion, Slack
│   ├── admin/                 # tenant management
│   └── cron/                  # daily healthcheck
│
├── src/                       # frontend React
│   ├── components/            # UI components (shadcn-based)
│   ├── pages/                 # rutas de la app
│   ├── hooks/                 # useAuth, useEnhancedChat, useIntegrations
│   ├── integrations/          # supabase client
│   └── lib/                   # utils
│
├── supabase/
│   ├── functions/             # Edge functions (Deno)
│   └── migrations/            # SQL migrations
│
├── scripts/                   # cron scripts (Node)
│
├── .github/workflows/         # GitHub Actions crons
│
└── docs/                      # documentación interna
```

## Pricing

| Plan | Precio | Queries incluidas | Overage |
|---|---|---|---|
| Starter | $29/mes | 500 | $0.05/query |
| **Pro** | **$99/mes** | **3,000** | **$0.04/query** |
| Team | $299/mes | 15,000 | $0.03/query |

Todos los planes incluyen integraciones ilimitadas (Drive, Notion, Slack...),
MCP server, y soporte por email.

## Docs adicionales

- [Roadmap](./docs/ROADMAP.md) — sprints 1-6 detallados
- [Master Brief](./docs/MASTER_BRIEF.md) — tesis, ICP, posicionamiento
- [Architecture](./docs/ARCHITECTURE.md) — schema DB + flujos OAuth
- [Agents](./docs/AGENTS.md) — agentes IA internos
- [Discovery](./docs/DISCOVERY.md) — entrevistas + wedge
- [Marketing](./docs/MARKETING_FACELESS_STRATEGY.md) — estrategia TikTok/LinkedIn
- [Security](./docs/SECURITY.md) — checklist + RLS audit
- [DPA Template](./docs/DPA_TEMPLATE.md) — para clientes empresariales

## Licencia

Propietario. © 2026 Eduardo Arnedo González. Todos los derechos reservados.

## Contacto

- Producto: [cerebro-ivory.vercel.app](https://cerebro-ivory.vercel.app)
- Soporte: hola@usacerebro.com
- Founder: Kike (Eduardo Arnedo) — Santiago, Chile
