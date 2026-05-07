# Data Processing Agreement (DPA) — Template Cerebro

> Acuerdo de Procesamiento de Datos para clientes empresariales.
> Personalizar las secciones marcadas con `[…]` antes de enviar.

---

**Entre:**
- **Controlador (Cliente):** [Razón social del cliente, RUT, dirección]
- **Procesador:** Cerebro — Eduardo Arnedo González, RUT [TU_RUT], Santiago, Chile

**Vigencia:** A partir de la fecha de firma y mientras dure la prestación del Servicio.

---

## 1. Objeto

Este DPA complementa los Términos de Servicio y regula el procesamiento de datos
personales que el Procesador realiza por cuenta del Controlador con el fin de
prestar el Servicio Cerebro descrito en los Términos.

## 2. Naturaleza y propósito del procesamiento

| Aspecto | Detalle |
|---|---|
| Naturaleza | Indexación de contenido y respuesta a consultas vía LLM |
| Propósito | Permitir al equipo del Cliente consultar su propio conocimiento empresarial |
| Categorías de datos | Documentos de Notion, Drive, Slack, Gmail, GitHub conectados; metadata de uso |
| Sujetos | Empleados, contratistas y partes con quienes interactúa el Cliente |
| Duración | Mientras dure la suscripción |

## 3. Obligaciones del Procesador

El Procesador:
- Procesa los datos solo bajo instrucciones documentadas del Controlador
- Garantiza confidencialidad de las personas autorizadas a procesar datos
- Implementa medidas técnicas y organizativas (Anexo A)
- Asiste al Controlador a cumplir obligaciones de respuesta a derechos de los titulares
- Notifica brechas de seguridad en menos de 72 horas
- Permite auditorías razonables con notificación previa de 30 días
- Elimina o devuelve datos al término del Servicio según instrucción

## 4. Subprocesadores

El Controlador autoriza el uso de los siguientes subprocesadores:

| Subprocesador | Servicio | Ubicación |
|---|---|---|
| Supabase | Auth + DB + Storage | AWS us-east-2 (USA) |
| Vercel | Hosting | USA / Edge global |
| Anthropic | LLM (Claude) | USA |
| Voyage AI | Embeddings | USA |
| GitHub | Crons + agentes IA | USA |

El Procesador notificará por email al menos 14 días antes de añadir o cambiar
subprocesadores. El Controlador puede oponerse por causa razonable.

## 5. Transferencias internacionales

Los datos se almacenan principalmente en USA. El Procesador asegura cláusulas
contractuales tipo (SCC) con cada subprocesador o equivalente bajo legislación
chilena vigente.

## 6. Brechas de seguridad

El Procesador notificará por email a [contacto@cliente.com] sin demora indebida y
en menos de 72 horas cuando tenga conocimiento de una brecha. La notificación
incluirá:
- Naturaleza de la brecha y categorías y número aproximado de afectados
- Datos de contacto del DPO o equivalente
- Consecuencias probables
- Medidas adoptadas o propuestas

## 7. Derechos de los titulares

El Procesador asiste al Controlador a responder solicitudes de acceso,
rectificación, supresión, limitación, portabilidad y oposición de los titulares
en menos de 30 días hábiles desde el requerimiento.

## 8. Eliminación al término

Al término del Servicio, el Controlador puede solicitar:
- (a) Devolución de datos en formato JSON dentro de 30 días
- (b) Eliminación segura de datos dentro de 30 días tras la solicitud

Por defecto, sin instrucción expresa, los datos se eliminan a los 30 días post-cancelación.

## 9. Auditoría

El Controlador puede auditar el cumplimiento del Procesador 1 vez al año con
notificación previa de 30 días, durante horario laboral, sin afectar la operación
del Servicio. El Procesador puede limitar el acceso a información que no concierna
exclusivamente al Controlador.

## 10. Responsabilidad

La responsabilidad del Procesador bajo este DPA está sujeta a las limitaciones de
los Términos de Servicio principales.

## 11. Jurisdicción

Este DPA se rige por las leyes de Chile. Las controversias se resolverán en los
tribunales de Santiago.

---

## Anexo A — Medidas técnicas y organizativas

### Cifrado
- TLS 1.3 en tránsito
- AES-256-GCM para tokens OAuth en reposo
- Postgres con cifrado en disco gestionado por Supabase

### Control de acceso
- Row-Level Security (RLS) por tenant en todas las tablas con datos del cliente
- Solo el dueño del tenant + invitados explícitos pueden acceder al workspace
- Auditoría de acceso en tablas críticas (waitlist, integrations, knowledge_base)
- Tokens de API con scopes limitados y revocables

### Resiliencia
- Backups diarios con retención de 30 días (Supabase)
- Recovery Point Objective (RPO): 24h
- Recovery Time Objective (RTO): 8h

### Personal
- Solo Eduardo Arnedo González (founder único) tiene acceso a producción a la fecha
- Conforme se contrate equipo, se firmará NDA y se otorgará acceso por necesidad

### Mejora continua
- Revisión trimestral de configuraciones de seguridad
- Penetration test externo al alcanzar 50+ clientes empresariales

---

**Firmas:**

Por el Controlador: ____________________________  Fecha: __________
[Nombre y cargo]

Por el Procesador: Eduardo Arnedo González  Fecha: __________
hola@usacerebro.com
