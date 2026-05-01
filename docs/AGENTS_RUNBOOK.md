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

**Estado:** activo desde 2026-04-30.
**Disparador:** GitHub Action `.github/workflows/strategist-briefing.yml` cada lunes (cron `0 13 * * 1` UTC ≈ 9 am hora Chile en invierno) y `workflow_dispatch` para invocación manual.
**Implementación:** `scripts/strategist.mjs` — Node 22+, sin deps externas, llama Anthropic API directo con `fetch`. Mismo estilo que el Code Reviewer.
**Modelo:** `claude-sonnet-4-6`, `max_tokens: 4000`.
**Subcomandos:**
- `briefing [--save]` — genera el briefing semanal a stdout. Con `--save` también escribe `docs/briefings/YYYY-MM-DD.md`.
- `decision --title "..." --context-file ruta.md [--dry-run]` — genera una entrada nueva en `CHANGELOG.md`, insertada arriba de la entrada más reciente. `--dry-run` solo imprime.

**Output del workflow semanal:**
- En `main`: commit directo con autor `Cerebro Strategist Agent <strategist-bot@cerebro.local>` y mensaje `chore(strategist): briefing semanal YYYY-MM-DD`.
- En cualquier otra branch (ej. testing del workflow): abre un PR a `main` con la branch `strategist/briefing-YYYY-MM-DD`.

### 3.1 Setup del secret `ANTHROPIC_API_KEY`

Reutiliza el mismo secret del Code Reviewer (`ANTHROPIC_API_KEY`). Si ya está configurado, el Strategist no requiere setup adicional. Si no:

```bash
set -a; source ~/.cerebro/credentials.env; set +a
gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY" --repo kikearnedo92/Cerebro
```

### 3.2 Cómo correr el briefing localmente

```bash
cd "$(git rev-parse --show-toplevel)"
set -a; source ~/.cerebro/credentials.env; set +a   # exporta vars al child process

# Imprime el briefing a stdout. Sin --save no escribe nada en disco.
node scripts/strategist.mjs briefing

# Para guardarlo en docs/briefings/YYYY-MM-DD.md además de imprimirlo:
node scripts/strategist.mjs briefing --save
```

Para validar la construcción del prompt sin gastar tokens:

```bash
STRATEGIST_DRY_RUN=1 node scripts/strategist.mjs briefing
```

> ⚠️ `source ~/.cerebro/credentials.env` por sí solo NO exporta las vars al proceso hijo en zsh — usar `set -a; source ...; set +a`.

### 3.3 Cómo registrar una decisión

Necesitás un archivo de contexto en Markdown con lo que disparó la decisión, opciones que se evaluaron, qué se decidió y por qué. El agente convierte eso en una entrada formal del CHANGELOG.

```bash
set -a; source ~/.cerebro/credentials.env; set +a

# Preview sin tocar CHANGELOG.md:
node scripts/strategist.mjs decision \
  --title "Subir pricing Starter a $79" \
  --context-file ~/Desktop/decision-pricing.md \
  --dry-run

# Aplicar (inserta arriba de la entrada más reciente del changelog):
node scripts/strategist.mjs decision \
  --title "Subir pricing Starter a $79" \
  --context-file ~/Desktop/decision-pricing.md
```

El bloque resultante usa exactamente el formato de la sección "FORMATO DE REGISTRO DE DECISIONES" en `docs/SYSTEM_PROMPTS.md`. Después podés revisar el diff (`git diff CHANGELOG.md`), ajustarlo a mano si hace falta, y commitearlo.

### 3.4 Cómo desactivar el workflow temporalmente

**Opción 1 — sin tocar repo:** disable el workflow desde la UI:
`https://github.com/kikearnedo92/Cerebro/actions/workflows/strategist-briefing.yml` → `...` → `Disable workflow`.

**Opción 2 — vía PR:** comentar el bloque `on:` en `.github/workflows/strategist-briefing.yml` o renombrar el archivo a `.github/workflows/strategist-briefing.yml.disabled`.

### 3.5 Cómo iterar sobre el system prompt

Idéntico al Code Reviewer:

1. Editar `docs/SYSTEM_PROMPTS.md` sección 3 ("Product Strategist Agent").
2. Probar local: `STRATEGIST_DRY_RUN=1 node scripts/strategist.mjs briefing` para confirmar que el prompt se construye OK; después `node scripts/strategist.mjs briefing` con la API real.
3. Si el output mejora, commitear el cambio del prompt en una branch + PR.
4. Mergeado a main, el siguiente run automático ya usa el prompt nuevo (el script lee `SYSTEM_PROMPTS.md` en cada ejecución).

### 3.6 Troubleshooting

#### El workflow del lunes no corrió

GitHub Actions a veces atrasa schedules de cron en repos con poca actividad. Causas:
- Repo dormido — pushear cualquier cambio a main lo "despierta".
- Cron 13:00 UTC ≠ 9 am Chile en horario de verano (oct–mar) — corre 1h más tarde, no es bug.
- Workflow disabled desde la UI — chequear el botón `Enable workflow`.

**Acción:** disparar manual via `workflow_dispatch` desde la UI del workflow.

#### El briefing falla con `ANTHROPIC_API_KEY no está definida`

- Local: olvidaste `set -a; source ~/.cerebro/credentials.env; set +a`.
- CI: el secret no está configurado en GitHub Actions o expiró. Re-correr `gh secret set ANTHROPIC_API_KEY ...` (ver 3.1).

#### El briefing aparece pero no se commitea

El step `Detect new briefing file` revisa `git status --porcelain docs/briefings/`. Si el archivo del día ya existía (ej. corriste el workflow dos veces el mismo lunes y el contenido salió idéntico), no hay diff y el commit se salta. Esperado.

#### La entrada de decisión rompe el formato del CHANGELOG

El script inserta el bloque ANTES de la entrada más reciente y agrega un separador `---`. Si el CHANGELOG no empieza con un heading `## ` (ej. alguien borró todas las entradas), el script falla con error claro. Solución: agregar al menos un heading `## ` placeholder y reintentar, o usar `--dry-run` y pegar a mano.

---

## 4. Discovery Analyst Agent

**Estado:** etapa 1 (post 4+ entrevistas). No construir todavía.
**System prompt fuente:** `docs/SYSTEM_PROMPTS.md` sección 4.

---

## Convención de modelos

Todos los agentes usan **`claude-sonnet-4-6`** por default. Razones:
- Latencia razonable para CI (~5-15s).
- Calidad suficiente para reviews y análisis estructurados.
- Costo contenido en etapa 0 (volumen bajo, ~5-15 PRs/semana, 1 briefing/semana).

Subir a `claude-opus-4-7` solo si el Code Reviewer empieza a aprobar PRs con problemas críticos detectables, o si el Strategist empieza a generar briefings/decisiones de baja calidad. Documentar el cambio en `CHANGELOG.md`.

> ⚠️ El nombre del modelo está duplicado en `scripts/code-review.mjs`, `scripts/strategist.mjs` y este runbook. Si lo cambias, actualizar los tres.
