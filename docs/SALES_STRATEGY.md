# Cerebro — Estrategia de ventas

**Objetivo:** 10 clientes pagando en 2–3 meses post-lanzamiento MVP (target: julio 2026). Total MRR estimado: $500–$1,500 (mix Starter/Growth).

---

## ICP (Ideal Customer Profile)

**Empresa:**
- Tamaño: 10–50 empleados
- Industria: servicios profesionales (consultoría, agencias, legal, finanzas), startups SaaS early-stage, estudios de diseño
- Tienen documentación dispersa en Notion + Google Drive + Slack (no solo un solo sitio)
- Fundador o Head of Ops activo y técnicamente curioso (no un CEO que no tocó una app nueva en 10 años)
- Zona geográfica: Chile, Colombia, México, España (mercados donde Kike tiene red)

**Persona decisora:**
- Head of Operations, COO, CTO, Founder
- Dolor: "mi equipo me pregunta lo mismo 5 veces al día", "nadie encuentra nada", "perdemos 30 min al día buscando el deck del cliente X"
- Edad: 28–45
- Tech-savvy, ya usa ChatGPT/Claude/Notion AI

**Lo que NO es ICP:**
- Empresas > 100 empleados (ciclos de venta largos, compliance pesado, son de Glean/Guru)
- Empresas regulated (bancos, healthcare) — por ahora
- Solos/freelancers (no necesitan multi-user)

---

## Propuesta de valor

> **"El segundo cerebro de tu empresa. Pregúntale cualquier cosa de tu Notion, Slack, Drive, Gmail y Calendar — responde en segundos con la información real de tu equipo."**

**Diferenciadores vs. competencia:**

| Competidor | Precio | Complejidad onboarding | Nuestro hook |
|---|---|---|---|
| Glean | $600/user/año ($5k+/mes) | Setup de semanas, requires vendor call | 10x más barato, self-serve |
| Notion AI | $10/user/mes, solo dentro de Notion | Limitado a su propio workspace | Multi-fuente (Notion + Slack + Drive + Gmail) |
| Guru | $10/user/mes | Requiere crear KB manual | Usa los docs que ya tienes |
| ChatGPT/Claude planes | $20/user/mes | No tiene contexto de tu empresa | Sí lo tiene, es el punto |

**Mensaje simple:** "Como Claude, pero que sabe de tu empresa."

---

## Estrategias de adquisición

### 🎯 Estrategia 1: Outreach manual en LinkedIn (alta prioridad)

**Por qué:** Kike tiene red en fintech/startups en LatAm. 50 outreach personalizados > 500 cold emails.

**Proceso:**
1. **Semana 5 del roadmap:** Kike hace lista de 100 contactos en LinkedIn que sean COO/CTO/Head of Ops de empresas 10–50 personas.
2. Usar Sales Navigator o filtros de búsqueda en LinkedIn (empresa < 50, puestos específicos, ubicación LatAm/Spain)
3. Mensaje templado (no genérico):

> Hola [Nombre],
>
> Vi que eres [Rol] en [Empresa]. Estoy construyendo Cerebro — un chat con IA que conecta el Notion, Slack y Drive de tu equipo para que nadie tenga que buscar manualmente los docs.
>
> ¿Te hace sentido un demo de 10 min? Si tu equipo pierde tiempo buscando cosas, creo que te puede interesar.
>
> — Kike (cerebro-ivory.vercel.app)

4. **Meta:** 10 mensajes/día × 20 días hábiles = 200 contactos. Conversión esperada: 5–10% → 10–20 demos.
5. **Herramienta:** Sheet en Google Sheets con columnas: Nombre, Empresa, LinkedIn URL, Mensaje enviado (sí/no), Respuesta, Estado (contactado / respondió / demo / cliente / descartado).

**Deliverable por Claude:** plantilla de sheet + 10 variaciones del mensaje de outreach adaptados por vertical.

---

### 🎯 Estrategia 2: Early customers de Retorna y red personal

**Por qué:** fácil. Kike conoce founders directamente.

**Target:**
- Founders que Kike conoce de Retorna/fintech
- Ex-colegas de consultorías/startups anteriores
- Amigos de colegio/universidad que son founders

**Meta:** 5 conversaciones directas en semana 1–2 del outreach. Cerrar 2–3 como early adopters con descuento "fundador" (ej: Growth a precio de Starter por 6 meses a cambio de feedback intenso + testimonio).

**Deliverable por Claude:** borrador de email "oye, estoy construyendo esto, ¿pruebas?" + formulario Typeform/Tally de feedback inicial.

---

### 🎯 Estrategia 3: Contenido + SEO

**Por qué:** bajo costo, escalable a medio plazo.

**Táctica:**
- 1 blog post técnico en Medium/Dev.to cada 2 semanas:
  - "How we built a multi-tenant RAG with Supabase and Claude"
  - "Notion vs. Claude vs. ChatGPT: which one actually knows your company?"
  - "From zero to multi-tenant in 2 weeks: lessons from building Cerebro"
- Compartir en HackerNews, r/SaaS, IndieHackers, Twitter
- SEO: página de comparación "Cerebro vs. Glean" optimizada para keywords

**Responsable del contenido:** Kike (escribe draft) + Claude (pule).

**Deliverable por Claude:** calendario editorial de 3 meses + 3 blog posts borrados iniciales.

---

### 🎯 Estrategia 4: Comunidades de founders

- **Startup Chile alumni** — grupo de WhatsApp/Slack
- **Endeavor Chile** — si Kike tiene acceso
- **Platzi / Laboratoria (emprendedores)** — LatAm
- **IndieHackers, Reddit (r/SaaS, r/startups)**
- **Product Hunt launch** en semana 10–11 (cuando haya 3+ clientes reales)

**Táctica:** no spamear. Aportar valor en conversaciones, mencionar Cerebro solo cuando tenga sentido. Product Hunt launch = evento.

**Deliverable por Claude:** checklist de Product Hunt launch + copy inicial del post.

---

### 🎯 Estrategia 5: Referidos

**Trigger:** cuando haya los 3 primeros clientes.

**Mecánica:**
- Cliente actual invita a otro founder → ambos reciben 1 mes gratis
- Tracking simple en DB: `tenants.referred_by = tenant_id`

**Deliverable por Claude:** feature de referidos en `/app/settings/referrals`, semana 9 del roadmap.

---

## Embudo esperado (3 meses)

| Etapa | Volumen | Conversión |
|---|---|---|
| Mensajes outreach | 200 | — |
| Respuestas interesadas | 30 (15%) | — |
| Demos agendadas | 15 (50% de respuestas) | — |
| Demos ejecutadas | 12 (80%) | — |
| Trials activos | 10 (83% de demos) | — |
| Clientes pagando | **3–5 del outreach** (30–50%) | — |
| Clientes pagando (red personal) | **3–5** | — |
| **Total 3 meses:** | **6–10 clientes** | — |

---

## Precio y plans (revisar)

| Plan | Precio | Target | Incluye |
|---|---|---|---|
| Starter | $49/mes | Equipos 5–10 | 1k queries, 100MB docs, 2 integraciones |
| Growth | $99/mes | Equipos 10–30 | 5k queries, 500MB docs, integraciones ilimitadas |
| Enterprise | Contact | 30+ | Todo, SSO, soporte dedicado, deploy dedicado |

**Trial:** 14 días sin tarjeta, todos los planes. Downgrade automático a "Free" (read-only, sin chat IA) si no paga.

---

## Métricas a trackear

- **Outreach:** mensajes enviados/semana, respuestas, demos agendadas
- **Conversión:** % signups → trial activo (al menos 1 sync de integración), % trial → paid
- **Churn:** clientes que se dan de baja mes 1, mes 2, mes 3
- **NPS:** encuesta manual a los primeros 10

Deliverable por Claude: dashboard en `/admin/sales` con estas métricas cuando haya data.

---

## Calendario ejecutable (para Kike)

### Mientras Claude construye (semanas 2–5)
- Semana 3: Kike hace lista de 100 prospects en LinkedIn
- Semana 4: Kike escribe draft de mensaje outreach (Claude lo pule)
- Semana 5: Kike prepara demo (Loom de 2 min + slides si hace falta)

### Outreach activo (semanas 6–10)
- Semana 6: 10 mensajes/día × 5 días = 50 mensajes primera tanda
- Semana 7: primeras 3–5 demos ejecutadas
- Semana 8: ajustar pitch según feedback, segunda tanda 50 mensajes
- Semana 9: primeras ventas cerradas
- Semana 10: Product Hunt launch si hay 3+ clientes reales

### Escala (semanas 11–12)
- Primeros caso de estudio público
- Referidos activos
- Ajustes de precio/plans según señales

---

## Riesgos y contingencias

| Riesgo | Plan B |
|---|---|
| Nadie responde outreach | Pivotear a contenido + Product Hunt + comunidades |
| Ciclos de venta muy largos | Bajar precio Starter a $29, trial a 30 días |
| Competencia lanza similar en LatAm | Acelerar SSO + custom domain (enterprise features) |
| Costos de Claude API > ingresos | Cachear responses, migrar a Haiku para queries simples, subir precios |

---

## Deliverables de Claude para esta estrategia

- [ ] Plantilla Google Sheet de tracking (50 columnas: contactos, estado, respuestas)
- [ ] 10 variaciones de mensaje outreach LinkedIn (por vertical y persona)
- [ ] Email a la red personal de Kike ("oye, estoy construyendo...")
- [ ] Landing page de comparación "Cerebro vs. Glean"
- [ ] Calendario editorial de blog posts (3 meses)
- [ ] Checklist Product Hunt launch
- [ ] Script de demo de 10 min (para Kike)
- [ ] Feature de referidos (semana 9)
- [ ] Dashboard de sales en /admin/sales
