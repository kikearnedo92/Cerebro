# Discovery — Plan de entrevistas

> Discovery-first es la regla. **No se construye más producto nuevo** hasta haber completado 8 entrevistas y decidido el wedge con data.

---

## Objetivo

Llegar a una decisión informada sobre el wedge inicial (A — humano, B — agentes IA, o mixto) tras **8 entrevistas mínimo** con perfiles de ICP. Disciplina: **1 conversación por semana arrancando 4 mayo 2026**.

## Tracker

`cerebro-discovery-tracker.xlsx` (sheet personal de Kike). Una fila por entrevista con 16 columnas. Cada entrevista feed el sistema de scoring.

---

## ICP a contactar

Heads of Operations · Heads of Customer Success · Chief of Staff · COO · Heads of AI · CTO · VP Engineering · líderes de automatización

En empresas tech-forward de **50–200 empleados** en LATAM (Chile/CO/MX/AR/PE) y Europa hispana (España).

## Pipeline objetivo semanal

Cada lunes a las 9:00 hora Chile (recordatorio iPhone activo), Kike manda **5 mensajes mínimo**:

- 2 LinkedIn 1er grado (Heads de Ops/CS/AI/CTO)
- 1 red Retorna extendida
- 1 desde comunidades (Slack fintech LATAM, Endeavor, etc.)
- 1 referido por founders del círculo cercano

**Meta:** 3 calls agendadas/semana → 1 efectiva/semana → **8+ entrevistas en 8–10 semanas**.

---

## Script de la conversación (25 minutos)

### Apertura (1 min)

> *"Estoy investigando cómo manejan las empresas el conocimiento operativo cuando crecen rápido — tanto el de las personas como el que necesitan los agentes IA. ¿Te puedo robar 25 minutos? No te voy a vender nada, solo entender tu realidad."*

### Bloque 1 — Diagnóstico humano (6 min)

1. Cuando entra alguien nuevo a tu equipo, ¿cuánto tarda en estar productivo? ¿Por qué?
2. ¿Recuerdas la última vez que tuviste que tomar una decisión y necesitabas info que sabías que existía pero no encontrabas? Cuéntame.
3. ¿Qué pasa cuando alguien clave se va de tu equipo? Cuéntame el último caso.

### Bloque 2 — Comportamiento real (5 min)

4. ¿Cómo manejan hoy la documentación de procesos? ¿Quién la mantiene?
5. ¿Cuántas herramientas usan para esto? (Notion, Slack, Drive, Confluence…)
6. ¿Investigan o hacen research? ¿Esa información se reusa después?

### Bloque 2.5 — Sondeo IA (5 min · CRÍTICO)

7. ¿Tu empresa tiene agentes IA o automatizaciones funcionando hoy?

   **Si SÍ:**
   - 7a. ¿Qué hacen exactamente? ¿Cuánto tiempo llevan en producción?
   - 7b. Cuando el agente no encuentra información o se equivoca con contexto de tu empresa, ¿qué pasa?
   - 7c. ¿Han tenido casos donde el agente alucinó? Cuéntame el último.
   - 7d. ¿Cómo le pasan contexto al agente hoy? (system prompt, RAG, vector DB, hardcoded…)
   - 7e. ¿Cuánto tiempo de tu equipo se va en mantener ese contexto actualizado?

   **Si NO pero planean:**
   - 7a. ¿En qué proyectos están pensando? ¿Cuándo arrancan?
   - 7b. ¿Cuál es su mayor preocupación al desplegar agentes con su data?

### Bloque 3 — Dolor económico (5 min)

8. ¿Horas que tu equipo pierde por temas de conocimiento al mes?
9. ¿Han pagado por alguna herramienta para resolver esto? ¿Cuánto?
10. En tu lista de prioridades de los próximos 6 meses, ¿dónde cae esto? ¿1-3, 4-7, o más abajo?

### Cierre (3 min)

11. ¿A quién más debería entrevistar?
12. Si en unos meses tengo algo para mostrarte, ¿te puedo escribir?

---

## Reglas no-negociables

❌ NO mencionar Cerebro al inicio
❌ NO mostrar el producto durante la entrevista
❌ NO pedir feedback sobre la idea
❌ NO decir "yo estoy construyendo algo así"
❌ NO guiar al entrevistado hacia respuestas
✅ Solo escuchar y tomar notas literales
✅ Si dice algo confuso, preguntar: *"¿me puedes contar un ejemplo concreto?"*

---

## Sistema de scoring (en el sheet)

### Score Humano (sobre 4)

1. Describió el dolor sin que lo guíen (1 pt)
2. Cuantificó horas perdidas (1 pt)
3. Cuantificó USD perdidos o pagados (1 pt)
4. Ya pagó por algo similar (1 pt)

### Score IA (sobre 3)

1. Tiene agentes/automatizaciones en producción hoy (1 pt)
2. Mencionó dolor con contexto/alucinación sin que lo guíen (1 pt)
3. Lo puso en prioridad alta (top 3) de los próximos 6 meses (1 pt)

### Score Total (sobre 8)

Humano + IA + 1 punto si vino por referido = máx 8.

**Verde ≥ 5 · Amarillo 3-4 · Rojo ≤ 2.**

---

## Tabla de decisión post-8 entrevistas

| Resultado | Wedge inicial |
|---|---|
| Score IA promedio ≥ 2/3 + ≥4 entrevistas con agentes en producción | **B** — Cerebro elimina alucinación. Pricing $499-1,999 |
| Score humano promedio ≥ 3/4 + ≥4 entrevistas mencionaron dolor humano | **A** — Cerebro mantiene memoria viva. Pricing $99-299 |
| Ambos cumplen | **B primero**, expandir a A después |
| Ninguno cumple | **Recalibrar ICP** — entrevistar otro segmento, otra geografía |

La decisión se documenta en `CHANGELOG.md` con fecha, número de entrevistas, scores, citas textuales que lo respaldan.

---

## Métricas semanales (cada viernes 5pm hora Chile)

1. ¿Hice mi conversación esta semana? Sí/No
2. ¿Cerré el entregable de código del lunes? Sí/No
3. ¿Cuántas personas externas usaron Cerebro esta semana? Número

**Alerta:** si dos viernes seguidos respondo "No" a la pregunta 1 → recalibrar plan o reconocer que el proyecto está en riesgo de abandono.

---

## Recordatorios configurados en iPhone de Kike

- **Lunes 4 mayo · 9:00 hora Chile** — *"Cerebro · Mandar 5 mensajes a Heads of Ops/CS/AI/CTO hoy"*
- **Cada viernes · 17:00** — *"Cerebro · Revisar avance discovery (1 conversación + foco semanal)"*

---

## Inputs útiles para el founder

- LinkedIn Sales Navigator (filtrar por puesto, tamaño empresa, geografía)
- Endeavor Chile, Startup Chile alumni networks
- Slack fintech LATAM (canales de founders/operadores)
- Comunidades Spanish-speaking en IndieHackers, ProductHunt LATAM
- Founders del círculo cercano (Retorna, ex-empleadores, programa Endeavor)

## Output esperado

- Notas literales en `cerebro-discovery-tracker.xlsx` por cada entrevista
- Citas textuales destacadas (top 3 por entrevista)
- Score numérico por entrevista
- Resumen de patrones cada 4 entrevistas (entregado por Discovery Analyst Agent en Etapa 1)
- Decisión de wedge documentada en `CHANGELOG.md` tras la 8va entrevista
