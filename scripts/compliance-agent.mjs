// Cerebro · Compliance / Legal Agent
//
// Weekly check on regulatory changes that may affect Cerebro:
//   - Ley 19.628 Chile (Protección de Vida Privada)
//   - GDPR (UE)
//   - LGPD (Brasil)
//   - SII Chile (facturación electrónica)
//   - TOS changes en Anthropic, Voyage AI, Supabase, Vercel
//
// Output: docs/compliance/YYYY-MM-DD.md committed to repo.
//
// Required env vars:
//   - ANTHROPIC_API_KEY

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

const SYSTEM_PROMPT = `Eres compliance officer para una startup SaaS chilena B2B (Cerebro).
Cerebro indexa contenido empresarial (Notion/Drive/Slack) y lo expone vía chat IA y MCP.
Operación: Chile + LATAM + España.
Stack: Supabase (USA), Vercel (USA), Anthropic (USA), Voyage AI (USA).
Solo 1 founder (Eduardo Arnedo), persona natural Chile, sin empresa creada.

Tu trabajo: identificar cambios regulatorios o de TOS de proveedores que requieran acción.

Devuelves un reporte markdown con secciones:
1. Cambios regulatorios LATAM (Chile 19.628, México LFPDPPP, Brasil LGPD, Argentina 25.326, Colombia 1581/2012)
2. Cambios GDPR / UE
3. Cambios en TOS de proveedores (Supabase, Vercel, Anthropic, Voyage)
4. Acciones requeridas (priorizadas: 🔴 urgente / 🟡 esta semana / 🟢 backlog)
5. Riesgos detectados

Para cada cambio: cita fuente, fecha, qué cambia, impacto en Cerebro.`

const userPrompt = `Reporte de la semana del ${today}.

Tu conocimiento debe complementarse con búsqueda web. Si tienes la herramienta web_search, úsala para verificar:
- ¿Hubo cambios en la Ley 19.628 Chile en los últimos 30 días?
- ¿Anthropic, Voyage AI, Supabase o Vercel actualizaron sus TOS o DPA en los últimos 30 días?
- ¿Hay alertas SII Chile sobre cambios en facturación electrónica afecta?
- ¿Hubo casos de aplicación de GDPR contra startups SaaS pequeñas?

Resume en markdown directo. Sin disclaimers innecesarios. Si no hay cambios relevantes, dilo en 1 línea por sección.`

console.log(`⚖️ Compliance Agent · ${today}`)

const resp = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
    messages: [{ role: 'user', content: userPrompt }],
  }),
})

if (!resp.ok) {
  console.error('Claude failed:', await resp.text())
  process.exit(1)
}

const data = await resp.json()
const textBlocks = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text)
const reportText = textBlocks.join('\n\n')

let md = `# Cerebro · Compliance Report — ${today}\n\n`
md += `> Generado por Compliance Agent · revisión semanal\n\n`
md += reportText
md += `\n\n---\n\n_Generated at ${new Date().toISOString()}_\n`

const path = `docs/compliance/${today}.md`
mkdirSync(dirname(path), { recursive: true })
writeFileSync(path, md)
console.log(`✅ Compliance report written to ${path}`)
