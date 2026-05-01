#!/usr/bin/env node
/**
 * Product Strategist Agent — CLI con dos subcomandos.
 *
 * Subcomandos:
 *
 *   briefing [--save]
 *     Genera el briefing semanal en el formato definido en
 *     docs/SYSTEM_PROMPTS.md sección 3 ("FORMATO DE BRIEFINGS SEMANALES").
 *     Imprime a stdout. Si --save, también escribe en docs/briefings/YYYY-MM-DD.md.
 *
 *   decision --title "..." --context-file ruta.md [--dry-run]
 *     Genera una entrada nueva de CHANGELOG.md con las secciones
 *     Contexto / Opciones evaluadas / Decisión / Trade-offs / Métricas
 *     siguiendo el formato del system prompt sección 3
 *     ("FORMATO DE REGISTRO DE DECISIONES").
 *     Inserta el bloque arriba de la entrada más reciente del CHANGELOG.
 *     Si --dry-run, solo imprime sin escribir.
 *
 * Uso local:
 *   set -a; source ~/.cerebro/credentials.env; set +a
 *   node scripts/strategist.mjs briefing
 *   node scripts/strategist.mjs briefing --save
 *   node scripts/strategist.mjs decision --title "Migrar a X" --context-file notas.md
 *   node scripts/strategist.mjs decision --title "Migrar a X" --context-file notas.md --dry-run
 *
 * Variables de entorno:
 *   ANTHROPIC_API_KEY     — requerida salvo que STRATEGIST_DRY_RUN=1
 *   STRATEGIST_DRY_RUN    — si =1, no llama Anthropic e imprime el prompt construido
 *
 * El script no debería romper producción: solo lee archivos y, opcionalmente,
 * escribe en docs/briefings/ o CHANGELOG.md (locales del repo).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4000;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// Limit por archivo de contexto (chars) para evitar explotar el prompt si algún
// doc crece sin control. 60k es generoso para los archivos actuales.
const FILE_CHAR_LIMIT = 60_000;

function log(msg) {
  console.error(`[strategist] ${msg}`);
}

function fail(msg, code = 1) {
  console.error(`[strategist] ERROR: ${msg}`);
  process.exit(code);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function parseArgs(argv) {
  const [, , subcommand, ...rest] = argv;
  const opts = {
    subcommand,
    save: false,
    dryRun: false,
    title: null,
    contextFile: null,
  };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--save') opts.save = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--title' && rest[i + 1]) opts.title = rest[++i];
    else if (a === '--context-file' && rest[i + 1]) opts.contextFile = rest[++i];
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a.startsWith('--')) {
      log(`Flag desconocido ignorado: ${a}`);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`
Product Strategist Agent — CLI

Subcomandos:
  briefing [--save]
      Genera el briefing semanal. Imprime a stdout. Si --save,
      escribe en docs/briefings/YYYY-MM-DD.md.

  decision --title "<titulo>" --context-file <ruta> [--dry-run]
      Genera una entrada de decisión y la inserta arriba de la
      entrada más reciente de CHANGELOG.md.

Env vars:
  ANTHROPIC_API_KEY      requerida salvo STRATEGIST_DRY_RUN=1
  STRATEGIST_DRY_RUN=1   no llama Anthropic, imprime el prompt construido

Ejemplos:
  set -a; source ~/.cerebro/credentials.env; set +a
  node scripts/strategist.mjs briefing
  STRATEGIST_DRY_RUN=1 node scripts/strategist.mjs briefing
  node scripts/strategist.mjs decision --title "Subir pricing" --context-file notas.md
`);
}

// -----------------------------------------------------------------------------
// System prompt — extraído de docs/SYSTEM_PROMPTS.md sección 3 en runtime.
// -----------------------------------------------------------------------------

function extractSystemPrompt() {
  const path = resolve(REPO_ROOT, 'docs/SYSTEM_PROMPTS.md');
  const md = readFileSync(path, 'utf8');
  const startMarker = '## 3. Product Strategist Agent';
  const endMarker = '## 4. Discovery Analyst Agent';
  const start = md.indexOf(startMarker);
  const end = md.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error(
      'No se encontró la sección "3. Product Strategist Agent" en docs/SYSTEM_PROMPTS.md. ' +
        'Asegurarse de que existan los headings "## 3. Product Strategist Agent" y "## 4. Discovery Analyst Agent".'
    );
  }
  const section = md.slice(start, end);
  const fenceStart = section.indexOf('```');
  const fenceEnd = section.indexOf('```', fenceStart + 3);
  if (fenceStart === -1 || fenceEnd === -1) {
    throw new Error(
      'No se encontró el bloque ``` ``` con el system prompt en la sección 3 de SYSTEM_PROMPTS.md'
    );
  }
  return section.slice(fenceStart + 3, fenceEnd).replace(/^\s*\n/, '').trim();
}

// -----------------------------------------------------------------------------
// Helpers de contexto del repo
// -----------------------------------------------------------------------------

function readRepoFile(relativePath) {
  const absPath = resolve(REPO_ROOT, relativePath);
  if (!existsSync(absPath)) {
    return null;
  }
  let content = readFileSync(absPath, 'utf8');
  if (content.length > FILE_CHAR_LIMIT) {
    content =
      content.slice(0, FILE_CHAR_LIMIT) +
      `\n\n... [archivo truncado: ${
        content.length - FILE_CHAR_LIMIT
      } chars adicionales no incluidos] ...`;
  }
  return content;
}

function buildFileSection(relativePath) {
  const content = readRepoFile(relativePath);
  if (content == null) {
    return `### ${relativePath}\n\n_(archivo no encontrado en el repo)_\n`;
  }
  return `### ${relativePath}\n\n\`\`\`md\n${content}\n\`\`\`\n`;
}

function getRecentGitLog() {
  // Avance reciente — 14 días. Si falta el rango, fallback al log entero corto.
  const r = run('git', [
    'log',
    '--since=14 days ago',
    '--pretty=format:%h %ad %s',
    '--date=short',
  ]);
  if (r.status === 0) {
    const out = r.stdout.trim();
    return out || '_(sin commits en los últimos 14 días)_';
  }
  log(`git log --since falló (${r.stderr.trim()}); fallback a últimos 20 commits`);
  const fallback = run('git', ['log', '-n', '20', '--pretty=format:%h %ad %s', '--date=short']);
  if (fallback.status !== 0) {
    return `_(no pude leer git log: ${fallback.stderr.trim()})_`;
  }
  return fallback.stdout.trim();
}

function getDaysSinceLastCommit() {
  const r = run('git', ['log', '-1', '--format=%cI']);
  if (r.status !== 0 || !r.stdout.trim()) {
    return { iso: null, days: null };
  }
  const iso = r.stdout.trim();
  const last = new Date(iso);
  if (Number.isNaN(last.getTime())) {
    return { iso, days: null };
  }
  const ms = Date.now() - last.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { iso, days };
}

function getChangedFilesLast14d() {
  // git diff --name-only HEAD@{14.days.ago} HEAD
  // Puede fallar si el reflog no tiene esa entrada (clones nuevos en CI).
  // Fallback: lista de archivos tocados por commits de los últimos 14 días.
  const direct = run('git', ['diff', '--name-only', 'HEAD@{14.days.ago}', 'HEAD']);
  if (direct.status === 0 && direct.stdout.trim()) {
    return direct.stdout.trim();
  }
  log('git diff HEAD@{14.days.ago} no disponible; fallback a log --name-only');
  const fallback = run('git', [
    'log',
    '--since=14 days ago',
    '--name-only',
    '--pretty=format:',
  ]);
  if (fallback.status !== 0) {
    return `_(no pude leer archivos modificados: ${fallback.stderr.trim()})_`;
  }
  const lines = fallback.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(lines)).sort();
  return unique.length ? unique.join('\n') : '_(sin archivos modificados en los últimos 14 días)_';
}

function todayIso() {
  // YYYY-MM-DD en hora local. El workflow corre en UTC; aceptable para el filename.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// -----------------------------------------------------------------------------
// Anthropic
// -----------------------------------------------------------------------------

async function callAnthropic(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY no está definida. Usar `set -a; source ~/.cerebro/credentials.env; set +a` antes de correr.'
    );
  }
  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!text) {
    throw new Error(`Respuesta vacía de Anthropic. stop_reason=${data.stop_reason}`);
  }
  return text;
}

// -----------------------------------------------------------------------------
// Subcomando: briefing
// -----------------------------------------------------------------------------

const BRIEFING_FILES = [
  'README.md',
  'CLAUDE.md',
  'docs/DISCOVERY.md',
  'docs/USE_CASES.md',
  'docs/AGENTS_RUNBOOK.md',
  'CHANGELOG.md',
];

function buildBriefingUserMessage() {
  const today = todayIso();
  const { iso: lastCommitIso, days: daysSince } = getDaysSinceLastCommit();
  const recentLog = getRecentGitLog();
  const changedFiles = getChangedFilesLast14d();

  const fileSections = BRIEFING_FILES.map(buildFileSection).join('\n');

  const lines = [
    'Generá el briefing semanal del proyecto Cerebro siguiendo EXACTAMENTE el formato definido en tu system prompt en la sección "FORMATO DE BRIEFINGS SEMANALES".',
    '',
    'Reglas:',
    '- Respondé en español.',
    '- No inventes datos de discovery: si los inputs no traen entrevistas nuevas, indicá "Sin nuevas entrevistas esta semana" y dejá los acumulados según lo que diga CHANGELOG.md o DISCOVERY.md.',
    '- Si detectás contradicciones entre docs (CLAUDE.md, README.md, DISCOVERY.md, CHANGELOG.md), listalas en la sección "Alertas".',
    '- Brevedad sobre verbosidad. Bullets, no párrafos.',
    '',
    'CONTEXTO TEMPORAL:',
    `- Fecha del briefing: ${today}`,
    `- Último commit: ${lastCommitIso || 'desconocido'}`,
    `- Días desde último commit: ${daysSince == null ? 'desconocido' : String(daysSince)}`,
    '',
    'AVANCE RECIENTE — `git log --since="14 days ago"`:',
    '',
    '```',
    recentLog,
    '```',
    '',
    'ARCHIVOS MODIFICADOS EN LOS ÚLTIMOS 14 DÍAS:',
    '',
    '```',
    changedFiles,
    '```',
    '',
    'CONTENIDO COMPLETO DE LOS ARCHIVOS DE CONTEXTO:',
    '',
    fileSections,
  ];
  return lines.join('\n');
}

async function cmdBriefing(opts) {
  const systemPrompt = extractSystemPrompt();
  log(`System prompt cargado (${systemPrompt.length} chars)`);

  const userMessage = buildBriefingUserMessage();
  log(`User message construido (${userMessage.length} chars)`);

  if (process.env.STRATEGIST_DRY_RUN === '1') {
    log('STRATEGIST_DRY_RUN=1 — no llamo a Anthropic, imprimo el prompt construido.');
    console.log('========== SYSTEM PROMPT ==========');
    console.log(systemPrompt);
    console.log('\n========== USER MESSAGE ==========');
    console.log(userMessage);
    console.log('\n========== END DRY RUN ==========');
    return;
  }

  let briefing;
  try {
    briefing = await callAnthropic(systemPrompt, userMessage);
  } catch (e) {
    fail(`Anthropic API falló: ${e.message}`);
  }

  console.log(briefing);

  if (opts.save) {
    const dir = resolve(REPO_ROOT, 'docs/briefings');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      log(`Directorio creado: ${dir}`);
    }
    const fileName = `${todayIso()}.md`;
    const filePath = resolve(dir, fileName);
    writeFileSync(filePath, briefing.endsWith('\n') ? briefing : briefing + '\n', 'utf8');
    log(`Briefing guardado en docs/briefings/${fileName}`);
  }
}

// -----------------------------------------------------------------------------
// Subcomando: decision
// -----------------------------------------------------------------------------

function buildDecisionUserMessage(title, contextText) {
  const today = todayIso();
  const lines = [
    'Tu tarea: generar UNA entrada de decisión para `CHANGELOG.md` siguiendo EXACTAMENTE el formato definido en tu system prompt en la sección "FORMATO DE REGISTRO DE DECISIONES".',
    '',
    'Reglas estrictas:',
    `- El heading debe ser "## ${today} · ${title}" (mismo formato que las entradas existentes).`,
    '- Las subsecciones requeridas, en este orden y con estos títulos exactos: "### Contexto", "### Opciones evaluadas", "### Decisión tomada", "### Trade-offs aceptados", "### Métricas para evaluar éxito".',
    '- Respondé en español.',
    '- No inventes opciones que no estén implícitas en el contexto. Si solo hay una opción evaluada, decilo explícitamente.',
    '- Brevedad sobre verbosidad. Bullets cortos.',
    '- NO incluyas separador `---` ni texto fuera del bloque de la decisión. Solo la entrada Markdown lista para insertar en el changelog.',
    '',
    'CONTEXTO PROVISTO POR KIKE:',
    '',
    contextText,
  ];
  return lines.join('\n');
}

function insertDecisionIntoChangelog(decisionMd) {
  const path = resolve(REPO_ROOT, 'CHANGELOG.md');
  const original = readFileSync(path, 'utf8');

  // Insertar antes de la entrada más reciente. Buscamos el primer "## "
  // que NO sea el "# CHANGELOG" del header (el que empieza con "## " == h2).
  const firstEntryRe = /^## /m;
  const match = firstEntryRe.exec(original);
  if (!match) {
    throw new Error('No se encontró ninguna entrada `## ` en CHANGELOG.md para insertar antes.');
  }
  const insertAt = match.index;
  const block = decisionMd.endsWith('\n') ? decisionMd : decisionMd + '\n';
  const updated = original.slice(0, insertAt) + block + '\n---\n\n' + original.slice(insertAt);

  writeFileSync(path, updated, 'utf8');
  return path;
}

async function cmdDecision(opts) {
  if (!opts.title) {
    fail('Falta --title "<titulo>" para registrar la decisión');
  }
  if (!opts.contextFile) {
    fail('Falta --context-file <ruta.md> con el contexto de la decisión');
  }
  const ctxPath = opts.contextFile.startsWith('/')
    ? opts.contextFile
    : resolve(process.cwd(), opts.contextFile);
  if (!existsSync(ctxPath)) {
    fail(`No encontré el archivo de contexto: ${ctxPath}`);
  }
  const contextText = readFileSync(ctxPath, 'utf8');
  if (!contextText.trim()) {
    fail(`El archivo de contexto está vacío: ${ctxPath}`);
  }

  const systemPrompt = extractSystemPrompt();
  log(`System prompt cargado (${systemPrompt.length} chars)`);

  const userMessage = buildDecisionUserMessage(opts.title, contextText);
  log(`User message construido (${userMessage.length} chars)`);

  if (process.env.STRATEGIST_DRY_RUN === '1') {
    log('STRATEGIST_DRY_RUN=1 — no llamo a Anthropic, imprimo el prompt construido.');
    console.log('========== SYSTEM PROMPT ==========');
    console.log(systemPrompt);
    console.log('\n========== USER MESSAGE ==========');
    console.log(userMessage);
    console.log('\n========== END DRY RUN ==========');
    return;
  }

  let decisionMd;
  try {
    decisionMd = await callAnthropic(systemPrompt, userMessage);
  } catch (e) {
    fail(`Anthropic API falló: ${e.message}`);
  }

  if (opts.dryRun) {
    log('--dry-run activo — no escribo CHANGELOG.md, solo imprimo la decisión.');
    console.log('========== DECISION (dry-run) ==========');
    console.log(decisionMd);
    console.log('========== END ==========');
    return;
  }

  let target;
  try {
    target = insertDecisionIntoChangelog(decisionMd);
  } catch (e) {
    fail(`No pude actualizar CHANGELOG.md: ${e.message}`);
  }
  log(`Decisión insertada arriba de la entrada más reciente en ${target}`);
  console.log(decisionMd);
}

// -----------------------------------------------------------------------------
// Entry point
// -----------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.help || !opts.subcommand) {
    printHelp();
    process.exit(opts.subcommand ? 0 : 1);
  }

  if (opts.subcommand === 'briefing') {
    await cmdBriefing(opts);
    return;
  }
  if (opts.subcommand === 'decision') {
    await cmdDecision(opts);
    return;
  }

  fail(`Subcomando desconocido: ${opts.subcommand}. Usá "briefing" o "decision". Ver --help.`);
}

main().catch((e) => {
  fail(`Excepción no controlada: ${e.stack || e.message}`);
});
