#!/usr/bin/env node
// Daily Standup Agent — runs every day at 8 AM Chile.
// Output: docs/standup/YYYY-MM-DD.md

import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY missing')
  process.exit(1)
}

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// 1. Recolectar git activity de las últimas 24h
const gitLog = execSync(
  `git log --since="${yesterday} 00:00" --pretty=format:"- %s (%an, %h)" --no-merges`,
  { encoding: 'utf8' }
).trim()

const filesChanged = execSync(
  `git diff --name-only HEAD~10..HEAD 2>/dev/null | head -20 || true`,
  { encoding: 'utf8' }
).trim()

// 2. Llamar a Claude para generar el briefing
const prompt = `Eres el Daily Standup Agent de Cerebro, una startup de capa de contexto operacional para empresas tech-forward.

CONTEXTO:
- Founder: Kike (Eduardo Arnedo, CCO) — no es desarrollador
- CTO: Memo (Claude)
- Estado del proyecto: discovery + producto en paralelo
- Product-led growth methodology
- Stack: React + Vercel + Supabase + Claude API

ACTIVIDAD DE LAS ÚLTIMAS 24 HORAS:

Commits:
${gitLog || '(sin commits)'}

Archivos cambiados recientemente:
${filesChanged || '(sin archivos)'}

TU TAREA:
Genera un briefing diario en español para Kike. Estructura el output así:

# Daily Standup — ${today}

## ✅ Ayer
(2-3 bullets de qué se commiteó / qué se completó)

## 🎯 Hoy — recomendación de Memo
(2-3 acciones concretas y específicas que Kike debería hacer hoy, ordenadas por impacto)

## 🔴 Bloqueadores y atención
(si detectas patrones de founder watch, gaps técnicos críticos, o decisiones pendientes)

## 📊 Métricas para reportar
(qué métricas Kike debería actualizar/revisar hoy: encuesta, MRR, entrevistas)

REGLAS:
- Tono cercano pero directo. Sin "Para Kike:" en cada línea — habla directo.
- Máximo 250 palabras totales.
- Si no hay commits ayer, di "ayer no hubo commits — recordatorio: aprovecha hoy".
- NO inventes datos que no están en el contexto.
- Cierra con UNA pregunta concreta para que Kike responda y arranque el día.`

const resp = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  }),
})

if (!resp.ok) {
  const errText = await resp.text()
  console.error('Claude API error:', errText)
  process.exit(1)
}

const data = await resp.json()
const briefing = data.content?.[0]?.text || ''

// 3. Escribir output
const outDir = 'docs/standup'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const outFile = `${outDir}/${today}.md`
writeFileSync(outFile, briefing)
console.log(`✓ Briefing escrito en ${outFile}`)
console.log('---')
console.log(briefing)
