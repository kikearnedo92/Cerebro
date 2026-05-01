# Agents Runbook

> Operación de los agentes IA del equipo Cerebro. Mantenido por Claude Code y el founder.
> Versionado humano-leíble — los system prompts viven en `docs/SYSTEM_PROMPTS.md`.

---

## 1. Code Reviewer Agent

**Estado:** activo desde 2026-05-01.
**Disparador:** GitHub Action `.github/workflows/code-review.yml` en cada `pull_request` (open, reopen, synchronize, ready_for_review) hacia `main`.
**Implementación:** `scripts/code-review.mjs` — Node 22+, sin deps externas, llama Anthropic API directo con `fetch`.
**Modelo:** `claude-sonnet-4-6`, `max_tokens: 4000`.
**Output:** comment del bot `github-actions[bot]` en el PR. Si el veredicto es **BLOQUEANTE 🔴** el job falla (status check rojo).

> Nota: el archivo del workflow requiere que el `GITHUB_PAT` con que Claude Code pushee tenga el scope `workflow` (no solo `repo`). Si en el futuro hay que regenerar el PAT, asegurar ambos scopes.

### 1.1 Setup del secret `ANTHROPIC_API_KEY`

El workflow requiere el secret `ANTHROPIC_API_KEY` en GitHub Actions. **Solo Kike puede agregarlo.**

```bash
# Opción 1 — UI
# https://github.com/kikearnedo92/Cerebro/settings/secrets/actions
# → New repository secret
# Name: ANTHROPIC_API_KEY
# Value: el sk-ant-api03-... que vive en ~/.cerebro/credentials.env

# Opción 2 — gh CLI (si Kike tiene gh autenticado en su Mac)
set -a; source ~/.cerebro/credentials.env; set +a
gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY" --repo kikearnedo92/Cerebro
```

**Sin este secret el workflow corre, llama Anthropic, recibe 401 y postea un comment de error sin bloquear el merge.** El primer PR de prueba validará si el secret está bien configurado.

### 1.2 Cómo testearlo localmente sin abrir un PR

```bash
cd "$(git rev-parse --show-toplevel)"
set -a; source ~/.cerebro/credentials.env; set +a   # exporta vars al child process

# Asegurate de estar en la branch que querés revisar
git checkout feat/mi-cambio

# Ejecutalo. Por defecto compara contra origin/main.
node scripts/code-review.mjs

# O contra otra base
node scripts/code-review.mjs --base origin/develop
```

El script imprime el review a stdout, **no postea nada** porque `GITHUB_PR_NUMBER` no está seteado.

> ⚠️ `source ~/.cerebro/credentials.env` por sí solo NO exporta las vars al proceso hijo en zsh — usar `set -a; source ...; set +a` o `export ANTHROPIC_API_KEY=...` antes.

### 1.3 Troubleshooting

#### El workflow se cuelga o supera 10 minutos

El job tiene `timeout-minutes: 10`. Si Anthropic está lento o el diff es enorme, el job se cancela. El PR no queda bloqueado — solo no recibe el comment del bot. Causas comunes:
- Diff enorme (>80k chars). El script trunca, así que esto rara vez es el problema.
- Anthropic con latencia/incidente — chequear https://status.anthropic.com.
- Acción `actions/checkout` lenta — re-runear el workflow.

**Acción:** re-runear desde la UI del PR (`Re-run all jobs`).

#### El bot no postea comment

1. Revisar el log del Action en la UI del PR → tab `Checks` → `Code Reviewer Agent` → step `Run Code Reviewer Agent`.
2. Causas frecuentes:
   - `ANTHROPIC_API_KEY` no configurada → error explícito en el log + comment de fallback en el PR.
   - `gh` falló por permisos → asegurarse de que `permissions.pull-requests: write` está en el yml.
   - Rate limit de Anthropic → comment de fallback se postea, exit 0.

#### El veredicto del bot es siempre "BLOQUEANTE"

Probablemente el system prompt está produciendo falsos positivos. Editar `docs/SYSTEM_PROMPTS.md` sección "1. Code Reviewer Agent" — el script lee directo de ahí cada vez que corre. Iterar es libre, no requiere redeploy.

#### Quiero verlo en acción contra un PR ya cerrado

```bash
source ~/.cerebro/credentials.env
git fetch origin pull/<NUM>/head:pr-<NUM>-test
git checkout pr-<NUM>-test
node scripts/code-review.mjs --base origin/main
```

### 1.4 Cómo desactivarlo temporalmente

**Opción 1 — sin tocar repo:** disable el workflow desde la UI:
`https://github.com/kikearnedo92/Cerebro/actions/workflows/code-review.yml` → `...` → `Disable workflow`.

**Opción 2 — vía PR:** comentar el bloque `on:` en `.github/workflows/code-review.yml` o renombrar el archivo a `.github/workflows/code-review.yml.disabled`.

**Opción 3 — bypass para un PR específico:** agregar el label `skip-review` al PR antes de abrirlo. *(No implementado todavía. Si se vuelve necesario, agregar al `if:` del job.)*

### 1.5 Cómo iterar sobre el system prompt

1. Editar `docs/SYSTEM_PROMPTS.md` sección 1.
2. Probar local: `node scripts/code-review.mjs` (sin `--base` corre contra `origin/main`).
3. Si el output mejora, commitear el cambio del prompt en una branch + PR.
4. Mergeado a main, el siguiente PR ya usa el prompt nuevo.

---

## 2. UX/UI Reviewer Agent

**Estado:** no implementado todavía. Recomendación: construir post-wedge cuando se itere UI nueva.
**System prompt fuente:** `docs/SYSTEM_PROMPTS.md` sección 2.

---

## 3. Product Strategist Agent

**Estado:** no implementado todavía. Mientras tanto los briefings y entradas de `CHANGELOG.md` los mantiene Claude Code manualmente.
**System prompt fuente:** `docs/SYSTEM_PROMPTS.md` sección 3.

---

## 4. Discovery Analyst Agent

**Estado:** etapa 1 (post 4+ entrevistas). No construir todavía.
**System prompt fuente:** `docs/SYSTEM_PROMPTS.md` sección 4.

---

## Convención de modelos

Todos los agentes usan **`claude-sonnet-4-6`** por default. Razones:
- Latencia razonable para CI (~5-15s).
- Calidad suficiente para reviews y análisis estructurados.
- Costo contenido en etapa 0 (volumen bajo, ~5-15 PRs/semana).

Subir a `claude-opus-4-7` solo si el Code Reviewer empieza a aprobar PRs con problemas críticos detectables. Documentar el cambio en `CHANGELOG.md`.

> ⚠️ El nombre del modelo está duplicado en `scripts/code-review.mjs` (constante `MODEL`) y en este runbook. Si lo cambias, actualizar ambos.

---

_Validación inicial end-to-end (2026-05-01): PR #1 / run 25229382835 / job 37s / comment posteado con formato correcto + marker HTML hidden. Este push trivial es para validar que el bot **edita** el comment existente en vez de crear uno nuevo._
