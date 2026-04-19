# Cerebro — Continuidad entre dispositivos y sesiones

> Cómo Kike puede hablar con Claude desde cualquier lado y retomar el proyecto sin perder contexto.

---

## Los 3 entornos de Claude

| Entorno | Capacidades | Limitaciones | Cuándo usar |
|---|---|---|---|
| **Cowork (Mac)** | File system, ejecutar código, pushear a GitHub, conectores (Gmail, Notion, Slack, Calendar), browser automation, memoria persistente local | Requiere Mac activo (vía RustDesk si Kike está lejos) | Sesiones de **desarrollo**: código, deploys, DB migrations |
| **Claude app iPhone (Chat)** | Conectores MCP (Gmail, Notion, etc.), WebFetch para leer URLs públicas, Proyectos (con instrucciones + archivos subidos) | Sin filesystem, sin ejecución de código, sin push | Sesiones de **planning**: revisar plan, pedir info, autorizar pasos |
| **claude.ai Web (Projects)** | Lo mismo que la app iPhone pero más cómodo. Proyectos con archivos subidos disponibles siempre | Sin filesystem local | Leer docs del proyecto, planning, análisis |

---

## Regla de oro de continuidad

**Toda información crítica vive en dos sitios:**

1. **En el repo** `github.com/kikearnedo92/Cerebro/tree/main/docs` — público, accesible desde cualquier Claude vía WebFetch
2. **En memoria persistente local del Mac** (`/sessions/bold-adoring-goldberg/mnt/.auto-memory/`) — accesible solo desde Cowork

Esto garantiza que cualquier Claude, en cualquier dispositivo, retome el hilo sin perder contexto.

---

## Cómo retomar desde iPhone (Claude app)

Si Kike abre una conversación nueva desde el iPhone:

1. Di: **"Lee github.com/kikearnedo92/Cerebro/blob/main/docs/HANDOFF.md y sigamos con Cerebro."**
2. Claude mobile usará WebFetch para leer el HANDOFF.md
3. El HANDOFF.md lo redirige a ROADMAP.md y PENDING_FROM_KIKE.md
4. A partir de ahí Claude ya tiene contexto completo

**Limitación:** desde iPhone Claude no puede:
- Leer credenciales de memoria local del Mac
- Pushear código
- Ejecutar migraciones SQL

Para esas cosas necesitas volver a Cowork Mac (vía RustDesk).

---

## Cómo retomar desde Cowork (Mac)

1. Abre Cowork en el Mac
2. Nueva conversación, di: **"Sigamos con Cerebro"**
3. Claude Cowork tiene acceso a:
   - Memoria persistente local (credenciales, preferencias, estado del proyecto)
   - Transcript de sesiones anteriores (con `mcp__session_info__list_sessions`)
   - Repo clonado en `/sessions/bold-adoring-goldberg/cerebro/`
4. Retoma automáticamente

---

## Flujo de autorizaciones async (durante vacaciones)

Cuando Claude necesita algo de Kike pero Kike no está:

### Opción A — Email (canal formal)
1. Claude escribe borrador de email vía Gmail MCP (si está conectado)
2. Envía a `eduardoarnedog@gmail.com` con subject `[Cerebro] Necesito X — urgencia: alta|media|baja`
3. Kike responde desde el iPhone cuando pueda
4. Claude lee la respuesta en la siguiente sesión vía Gmail MCP

### Opción B — Archivo en repo
1. Claude actualiza `docs/PENDING_FROM_KIKE.md` con lo pendiente
2. Kike revisa el archivo cuando tenga tiempo (desde iPhone via GitHub)
3. Kike responde en Claude app con "Ya hice el item N, la credencial es X"

### Opción C — WhatsApp (NO disponible aún)
Sin MCP de WhatsApp al 2026-04. Si en el futuro se agrega uno, se actualiza este doc.

---

## Buenas prácticas para Kike

- **Antes de irte de vacaciones:** confirma que `docs/PENDING_FROM_KIKE.md` esté vacío o con items resueltos. Si no, resuelve los bloqueantes.
- **Durante vacaciones:** revisa tu Gmail una vez al día; si hay email `[Cerebro]` lo respondes.
- **Si quieres retomar desde iPhone:** siempre empieza con "Lee `docs/HANDOFF.md` y sigamos". No repitas contexto que ya está ahí.
- **Cuando vuelvas:** abre Cowork Mac, di "sigamos con Cerebro", Claude resume estado actual.

---

## Buenas prácticas para Claude (cualquier futuro)

- Al inicio de cada sesión de Cerebro, leer `docs/HANDOFF.md` y `docs/PENDING_FROM_KIKE.md`.
- Si estás en iPhone sin acceso a filesystem, usar WebFetch a `https://raw.githubusercontent.com/kikearnedo92/Cerebro/main/docs/HANDOFF.md`.
- Si estás en Cowork Mac, también leer memoria persistente en `/sessions/bold-adoring-goldberg/mnt/.auto-memory/`.
- Nunca re-pedir info que ya esté en docs o memoria. Si la necesitas, léela primero.
- Siempre actualizar `docs/PENDING_FROM_KIKE.md` al final de la sesión con lo que queda pendiente.
