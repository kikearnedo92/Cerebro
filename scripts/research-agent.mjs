#!/usr/bin/env node
// Research Agent — runs every Sunday 8 PM Chile.
// Output: docs/research/YYYY-MM-DD.md
//
// Usa Anthropic Claude con tool web_search habilitada para investigar
// competidores, trending topics y pain points públicos.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing')
  process.exit(1)
}

const today = new Date().toISOString().split('T')[0]

const prompt = `Eres el Research Agent de Cerebro, una startup de capa de contexto operacional.

CONTEXTO DEL PRODUCTO:
- Cerebro: capa de contexto que conecta Notion/Drive/Slack y responde preguntas con grounding
- Tesis: humanos + agentes IA usan el mismo backend de contexto
- ICP: empresas tech-forward 50-200 personas en LATAM y España
- Competidores: Glean, Notion AI, Mem.ai, Guru, Coworker AI, Dust, Microsoft Copilot
- Validación externa: YC RFS Summer 2026 ("company brain for AI agents")

TU TAREA:
Hacer research en la web SOBRE el espacio de Cerebro y entregar un briefing semanal estructurado.

USA WEB SEARCH para investigar 4 ejes:

1. **Movimientos de competidores en última semana**: lanzamientos, pricing changes, features nuevas, partnerships, acquisiciones de Glean/Notion AI/Coworker/Mem/Guru/Dust
2. **Trending topics enterprise AI**: alucinaciones, knowledge management, enterprise search, RAG, agentes IA con contexto
3. **Pain points públicos en Reddit/X/HN/foros**: gente quejándose de problemas que Cerebro resuelve
4. **Estadísticas/reports nuevos**: stats sobre uso de IA en enterprise, tiempo perdido buscando info, etc.

Estructura el output así:

# Research Briefing — ${today}

## 📊 Resumen ejecutivo (3-5 bullets)
(insights más accionables de la semana)

## 🏢 Movimientos de competidores
(qué hizo cada uno, link a fuente)

## 🔥 Trending topics
(temas que están subiendo en relevancia)

## 💢 Pain points públicos
(quejas reales en Reddit/X/HN — citas literales si encuentras)

## 📈 Stats/datos nuevos
(números que sirvan para pitch / landing)

## 🎯 Implicaciones para Cerebro
(qué deberíamos hacer esta semana basado en este research)

## 🔗 Fuentes
(URLs de todo lo citado)

REGLAS:
- Tono profesional pero directo, en español
- Cita fuentes con URLs reales
- Si no encuentras info nueva en algún eje, dilo (no inventes)
- Máximo 1500 palabras totales
- Findings deben ser ACCIONABLES, no academic`

const resp = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 8,
      },
    ],
    messages: [{ role: 'user', content: prompt }],
  }),
})

if (!resp.ok) {
  const errText = await resp.text()
  console.error('Claude API error:', errText)
  process.exit(1)
}

const data = await resp.json()
// Extract text content (web_search tool may produce multiple content blocks)
const textBlocks = (data.content || []).filter(c => c.type === 'text')
const briefing = textBlocks.map(b => b.text).join('\n\n')

if (!briefing) {
  console.error('No text in response')
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}

const outDir = 'docs/research'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const outFile = `${outDir}/${today}.md`
writeFileSync(outFile, briefing)
console.log(`✓ Research escrito en ${outFile}`)
console.log('---')
console.log(briefing.substring(0, 500) + '...')
