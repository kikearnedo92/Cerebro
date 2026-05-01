#!/usr/bin/env node
/**
 * Code Reviewer Agent — invocado por .github/workflows/code-review.yml
 *
 * Modo CI (GITHUB_PR_NUMBER presente):
 *   - Lee el diff via `gh api repos/{repo}/pulls/{pr}/files`
 *   - Llama Anthropic API con el system prompt extraído de docs/SYSTEM_PROMPTS.md
 *   - Postea el review como comment del bot via `gh pr comment`
 *   - exit 1 si veredicto = BLOQUEANTE; exit 0 en otros casos
 *
 * Modo local (sin GITHUB_PR_NUMBER):
 *   - `git diff <base>...HEAD` (default base: origin/main)
 *   - Imprime el review a stdout, no postea nada
 *
 * Uso local:
 *   ANTHROPIC_API_KEY=... node scripts/code-review.mjs [--base origin/main]
 *
 * El script nunca falla por errores de red/API: si Anthropic falla, postea un
 * comment marcando el problema y sale con exit 0 para no bloquear el PR.
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4000;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DIFF_CHAR_LIMIT = 80_000;

function log(msg) {
  console.log(`[code-review] ${msg}`);
}

function fail(msg) {
  console.error(`[code-review] ERROR: ${msg}`);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.status !== 0) {
    const stderr = result.stderr || result.stdout || '';
    throw new Error(`${cmd} ${args.join(' ')} exited ${result.status}: ${stderr.trim()}`);
  }
  return result.stdout;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { base: 'origin/main' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base' && args[i + 1]) {
      opts.base = args[++i];
    }
  }
  return opts;
}

function extractSystemPrompt() {
  const path = resolve(REPO_ROOT, 'docs/SYSTEM_PROMPTS.md');
  const md = readFileSync(path, 'utf8');
  const startMarker = '## 1. Code Reviewer Agent';
  const endMarker = '## 2. UX/UI Reviewer Agent';
  const start = md.indexOf(startMarker);
  const end = md.indexOf(endMarker);
  if (start === -1 || end === -1) {
    throw new Error('No se encontró sección "1. Code Reviewer Agent" en docs/SYSTEM_PROMPTS.md');
  }
  const section = md.slice(start, end);
  const fenceStart = section.indexOf('```');
  const fenceEnd = section.indexOf('```', fenceStart + 3);
  if (fenceStart === -1 || fenceEnd === -1) {
    throw new Error('No se encontró el bloque de system prompt en docs/SYSTEM_PROMPTS.md');
  }
  return section.slice(fenceStart + 3, fenceEnd).replace(/^\s*\n/, '').trim();
}

const SENSITIVE_PATH_RE = /(^|\/)(\.env(\..*)?$|credentials[^/]*$|.*\.(pem|key|p12|pfx|crt)$)/i;

function getDiffFromGh(repo, prNumber) {
  log(`Obteniendo diff del PR #${prNumber} via gh api`);
  const filesJson = run('gh', ['api', `repos/${repo}/pulls/${prNumber}/files`, '--paginate']);
  const files = JSON.parse(filesJson);
  const parts = [];
  for (const f of files) {
    const header = `### ${f.filename} (+${f.additions} -${f.deletions}, status: ${f.status})`;
    if (SENSITIVE_PATH_RE.test(f.filename)) {
      parts.push(
        `${header}\n\n_(archivo excluido del review automático por path potencialmente sensible — revisar manualmente)_`
      );
      continue;
    }
    const patch = f.patch ? f.patch : '(binary file or no patch available)';
    parts.push(`${header}\n\n\`\`\`diff\n${patch}\n\`\`\``);
  }
  return parts.join('\n\n');
}

function getDiffFromGit(base) {
  log(`Obteniendo diff local: git diff ${base}...HEAD`);
  try {
    return run('git', ['diff', `${base}...HEAD`]);
  } catch (e) {
    log(`Fallback a git diff HEAD~1: ${e.message}`);
    return run('git', ['diff', 'HEAD~1', 'HEAD']);
  }
}

function truncateDiff(diff) {
  if (diff.length <= DIFF_CHAR_LIMIT) return diff;
  return (
    diff.slice(0, DIFF_CHAR_LIMIT) +
    `\n\n... [diff truncado: ${diff.length - DIFF_CHAR_LIMIT} caracteres adicionales no mostrados] ...`
  );
}

async function callAnthropic(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no está definida');
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

function detectVerdict(reviewMd) {
  const headerLine = reviewMd
    .split('\n')
    .find((l) => l.trim().startsWith('## Code Review'));
  if (!headerLine) return 'DESCONOCIDO';
  if (/BLOQUEANTE/i.test(headerLine)) return 'BLOQUEANTE';
  if (/CAMBIOS\s+REQUERIDOS/i.test(headerLine)) return 'CAMBIOS_REQUERIDOS';
  if (/APROBADO/i.test(headerLine)) return 'APROBADO';
  return 'DESCONOCIDO';
}

function checkGhAvailable() {
  const result = spawnSync('gh', ['--version'], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error('gh CLI no encontrado. Instalar desde https://cli.github.com');
  }
}

const BOT_COMMENT_MARKER = '<!-- code-reviewer-agent:cerebro -->';

function findExistingBotComment(repo, prNumber) {
  try {
    const out = run('gh', [
      'api',
      `repos/${repo}/issues/${prNumber}/comments`,
      '--paginate',
      '--jq',
      `[.[] | select(.body | contains("${BOT_COMMENT_MARKER}")) | .id] | last // empty`,
    ]);
    const trimmed = out.trim();
    return trimmed ? trimmed : null;
  } catch (e) {
    log(`No pude listar comments existentes (${e.message}); creo uno nuevo.`);
    return null;
  }
}

function postPrComment(repo, prNumber, body) {
  const bodyWithMarker = `${BOT_COMMENT_MARKER}\n${body}`;
  const existingId = findExistingBotComment(repo, prNumber);

  if (existingId) {
    log(`Editando comment existente del bot (id=${existingId})`);
    const result = spawnSync(
      'gh',
      ['api', `repos/${repo}/issues/comments/${existingId}`, '-X', 'PATCH', '-F', 'body=@-'],
      { input: bodyWithMarker, encoding: 'utf8' }
    );
    if (result.status === 0) return;
    log(`PATCH falló (${result.stderr || result.stdout}); fallback a crear comment nuevo.`);
  }

  log(`Posteando comment nuevo en PR #${prNumber}`);
  const result = spawnSync('gh', ['pr', 'comment', String(prNumber), '--body-file', '-'], {
    input: bodyWithMarker,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`gh pr comment falló: ${result.stderr || result.stdout}`);
  }
}

async function main() {
  const opts = parseArgs();
  const prNumber = process.env.GITHUB_PR_NUMBER;
  const repo = process.env.GITHUB_REPOSITORY;
  const isCi = Boolean(prNumber && repo);

  log(`Modo: ${isCi ? 'CI' : 'local'}`);

  if (isCi) {
    try {
      checkGhAvailable();
    } catch (e) {
      fail(e.message);
    }
  }

  const systemPrompt = extractSystemPrompt();
  log(`System prompt cargado (${systemPrompt.length} chars)`);

  let diff;
  try {
    diff = isCi ? getDiffFromGh(repo, prNumber) : getDiffFromGit(opts.base);
  } catch (e) {
    fail(`No pude obtener el diff: ${e.message}`);
  }

  if (!diff || !diff.trim()) {
    log('Diff vacío. Nada para revisar.');
    if (isCi) {
      try {
        postPrComment(repo, prNumber, '## Code Review · APROBADO ✅\n\nNo hay cambios detectados en el diff.');
      } catch (e) {
        log(`No pude postear comment de diff vacío: ${e.message}`);
      }
    }
    process.exit(0);
  }

  const truncated = truncateDiff(diff);
  log(`Tamaño del diff: ${diff.length} chars (${truncated.length} enviados)`);

  const userMessage = [
    'Revisa el siguiente Pull Request siguiendo las instrucciones del system prompt.',
    '',
    'CONTEXTO ADICIONAL:',
    `- Repo: ${repo || 'local'}`,
    `- PR: ${prNumber ? `#${prNumber}` : 'local diff'}`,
    `- Base branch: ${process.env.GITHUB_BASE_REF || 'main'}`,
    `- Head branch: ${process.env.GITHUB_HEAD_REF || 'HEAD'}`,
    '',
    'DIFF DEL PULL REQUEST:',
    '',
    truncated,
  ].join('\n');

  let review;
  try {
    review = await callAnthropic(systemPrompt, userMessage);
  } catch (e) {
    log(`Anthropic API falló: ${e.message}`);
    const failMsg = [
      '## Code Review · ERROR ⚠️',
      '',
      `El Code Reviewer Agent no pudo completar el review automático: \`${e.message}\``,
      '',
      'Esto **no bloquea** el merge. Revisa manualmente o reintentá el workflow.',
    ].join('\n');
    if (isCi) {
      try {
        postPrComment(repo, prNumber, failMsg);
      } catch (postErr) {
        log(`Tampoco pude postear el comment de error: ${postErr.message}`);
      }
    } else {
      console.log(failMsg);
    }
    process.exit(0);
  }

  const verdict = detectVerdict(review);
  log(`Veredicto detectado: ${verdict}`);

  const finalBody = [
    review,
    '',
    '---',
    '_Comentado por **Code Reviewer Agent** · `claude-sonnet-4-6` · ver `docs/AGENTS_RUNBOOK.md` para troubleshooting._',
  ].join('\n');

  if (isCi) {
    try {
      postPrComment(repo, prNumber, finalBody);
    } catch (e) {
      log(`No pude postear el comment del review: ${e.message}`);
      console.log(finalBody);
    }
  } else {
    console.log('\n========== REVIEW OUTPUT ==========\n');
    console.log(finalBody);
    console.log('\n========== END REVIEW ==========\n');
  }

  if (verdict === 'BLOQUEANTE') {
    log('Veredicto BLOQUEANTE — exit 1');
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  fail(`Excepción no controlada: ${e.stack || e.message}`);
});
