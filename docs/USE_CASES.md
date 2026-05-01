# Use Cases — Los 14 casos de uso mapeados

> Mapa completo del territorio. Cada caso tiene comprador, dolor, pricing implícito. Ayuda a decidir qué validar primero en discovery y, post-wedge, qué construir.

---

## 🟢 Comprador A · Humanos (6 casos)

### 1. Onboarding de personas nuevas
**Dolor:** N1 nuevo tarda 4 semanas en estar productivo porque depende de que Jorge le explique todo. **Promesa:** N1 nuevo pregunta a Cerebro y obtiene respuesta validada en segundos. **Pricing implícito:** medio-alto si reduce time-to-productive en 50%+.

### 2. Memoria de research ⭐
**Dolor:** Hicieron research de un dolor de cliente hace 6 meses y nadie recuerda los hallazgos. **Promesa:** Cerebro compara hallazgos históricos vs actuales, detecta si el dolor cambió. **Pricing implícito:** medio. ICP: Heads of Product/Research.

### 3. Decisiones recurrentes con criterio histórico
**Dolor:** Caso edge llega y nadie sabe cómo se resolvió la última vez. **Promesa:** Cerebro retrieve decisiones similares pasadas con su contexto. **Pricing implícito:** medio. ICP: Customer Success, Operations.

### 4. Continuidad cuando alguien se va
**Dolor:** Persona clave renuncia y se lleva todo el contexto en su cabeza. **Promesa:** Cerebro captura el conocimiento antes de la salida. **Pricing implícito:** alto en empresas con turnover real.

### 5. Procesos vivos vs documentados
**Dolor:** Lo escrito en Notion no coincide con lo que el equipo realmente hace. **Promesa:** Cerebro detecta el drift y lo señala. **Pricing implícito:** medio. ICP: Operations, Compliance.

### 6. Voice of Customer histórico acumulado ⭐
**Dolor:** Feedback de clientes está fragmentado en 5 canales (Slack, support, NPS, encuestas, calls). **Promesa:** Cerebro consolida en un solo lugar consultable. **Pricing implícito:** medio-alto. ICP: Heads of CS, Product.

---

## 🟠 Comprador B · Agentes IA (5 casos)

### 7. Contexto operacional para agentes ⭐⭐ PUNTA DE LANZA
**Dolor:** El agente de soporte/sales/ops responde sin saber cómo es realmente la empresa. **Promesa:** Cerebro es la API que el agente consulta antes de responder. **Pricing implícito:** muy alto. ICP: CTO, Head of AI, líderes de automatización.

### 8. Skills file ejecutable (tesis YC)
**Dolor:** No existe el skills file que YC describe en el RFS Summer 2026 — cada empresa tiene que reinventarlo. **Promesa:** Cerebro genera y mantiene vivo el skills file. **Pricing implícito:** alto. ICP: empresas YC-curious, tech-forward.

### 9. Reducción de alucinaciones por falta de contexto ⭐⭐ PUNTA DE LANZA
**Dolor:** 47% de usuarios enterprise basaron al menos una decisión en contenido alucinado (Deloitte). 72% de fallas IA en empresas se atribuyen a contexto inadecuado (IBM). **Promesa:** Cerebro reduce alucinaciones medibles vía grounding empresarial. **Pricing implícito:** muy alto. ROI directo y demostrable.

### 10. Multi-agente coordinado con contexto compartido
**Dolor:** Cada agente IA reconstruye su propio contexto, sin coordinación entre ellos. **Promesa:** Cerebro es la capa común que todos consultan. **Pricing implícito:** alto. ICP: empresas con ≥3 agentes en producción.

### 11. Onboarding de nuevos agentes
**Dolor:** Cada agente IA nuevo arranca de cero — re-construir prompts, re-conectar fuentes, re-curar data. **Promesa:** Agente nuevo se conecta a Cerebro y hereda contexto día 1. **Pricing implícito:** medio-alto. ICP: empresas que despliegan agentes seguido.

---

## 🟣 Mixtos (3 casos)

### 12. Q&A interno auditado
**Dolor:** Humanos y agentes responden distinto a la misma pregunta de empleados/clientes. **Promesa:** Cerebro es la fuente de verdad común. **Pricing implícito:** alto. ICP: empresas reguladas.

### 13. Detección de drift de procesos
**Dolor:** Los procesos derivan de lo documentado sin que nadie lo detecte → riesgo compliance. **Promesa:** Cerebro alerta cuando lo real diverge de lo escrito. **Pricing implícito:** alto en sectores regulados (fintech, salud, legal). ICP: Compliance officers.

### 14. Memoria de incidentes
**Dolor:** Mismo incidente vuelve a pasar porque nadie aprendió del último. **Promesa:** Cerebro mantiene memoria de incidentes consultable por humanos y agentes. **Pricing implícito:** alto. ICP: Heads of Engineering, SRE.

---

## Punta de lanza recomendada

**Casos #7 + #9 combinados:** *"Cerebro es la capa de contexto operacional que tus agentes consultan antes de responder, reduciendo alucinaciones medibles."*

Es el wedge que:
- Tiene mejor pricing implícito ($499-1,999/mes)
- Tiene ROI directo y medible (reducción de alucinaciones)
- Está validado por research externo (YC RFS, Deloitte 47%, IBM 72%)
- Diferencia de Glean (el incumbent va por el dolor humano enterprise) y de Notion AI (limitado a su propio workspace)

**Pero la decisión final espera 8 entrevistas.** Discovery sobre opinión.

---

## Cómo usar este mapa en entrevistas

- **NO** validar casos en la entrevista (eso sesga al entrevistado).
- **SÍ** comparar las respuestas espontáneas del entrevistado contra estos casos para hacer scoring.
- Si menciona dolor que cae en caso #X sin que lo guíen → fuerte señal del comprador asociado.
- Si menciona dolor que NO está en este mapa → caso 15 candidato. Documentar.
