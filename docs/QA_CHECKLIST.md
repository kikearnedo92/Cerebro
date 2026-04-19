# Cerebro — QA Checklist manual (end-to-end)

Ejecuta este checklist completo antes de cada release. Tiempo estimado: 20–25 min.

Marca ✅ o ❌ con nota del bug. Si algo falla, abrir issue en GitHub.

---

## Bloque A — Landing y Auth (5 min)

- [ ] `cerebro-ivory.vercel.app` carga sin errores en desktop
- [ ] CTA "Empezar gratis" lleva a `/auth` (signup)
- [ ] Signup con email nuevo funciona y envía correo de confirmación
- [ ] El link del correo redirige a `cerebro-ivory.vercel.app` (NO a `localhost`)
- [ ] La pantalla post-confirmación muestra mensaje claro + botón "Ir a Cerebro"
- [ ] Logout y login de nuevo con la misma cuenta funciona
- [ ] Flujo completo funciona también en **mobile** (iPhone Safari)

## Bloque B — Chat (core) (10 min)

- [ ] Login lleva directo a `/app/chat`
- [ ] Input visible al entrar, sin scroll
- [ ] Input recibe focus automático (puedo escribir sin clic extra)
- [ ] Enter envía mensaje; Shift+Enter hace salto de línea
- [ ] Claude responde en < 10s
- [ ] Respuesta se renderiza con markdown
- [ ] Scroll sigue al último mensaje al enviar varios
- [ ] Botón "Nueva conversación" funciona y la anterior queda en historial
- [ ] Mobile: chat full screen, input anclado abajo, no se superpone al teclado
- [ ] Botón "Detener" cancela una generación en progreso

## Bloque C — Knowledge Base (5 min)

- [ ] Subir PDF/MD → aparece en lista
- [ ] Marcar como "activo"
- [ ] Preguntar en chat con KB activo → respuesta cita el doc
- [ ] "Sources" muestra título del doc
- [ ] Eliminar doc → desaparece

## Bloque D — Integraciones (5 min)

- [ ] `/app/integrations` muestra 5 tarjetas
- [ ] Click "Conectar Notion" → abre OAuth de Notion
- [ ] Tras autorizar → vuelvo a la app con la integración en "connected"
- [ ] Hacer sync manual → aparecen páginas indexadas
- [ ] Preguntar en chat por contenido de Notion → respuesta correcta
- [ ] Desconectar Notion → status vuelve a "disconnected"

## Bloque E — Admin de tenants (3 min)

- [ ] Como super-admin, `/admin` muestra lista de todos los tenants
- [ ] Click en tenant → ver users, usage, plan, integraciones
- [ ] Como tenant-admin, `/app/users` muestra users de mi tenant
- [ ] Invitar user por email → recibe correo con link de signup pre-asociado al tenant
- [ ] Invitado se registra → entra directo al tenant correcto

## Bloque F — Stripe y planes (5 min)

- [ ] `/pricing` lista planes
- [ ] Click "Elegir plan" (logged out) → redirige a `/auth`
- [ ] Click "Elegir plan" (logged in) → Stripe Checkout
- [ ] Pago test con `4242 4242 4242 4242` → vuelvo a la app con plan activo
- [ ] Webhook marca `subscription_active` en DB
- [ ] Superar el límite del plan → bloqueo con mensaje "Actualiza tu plan"

---

## Test data de apoyo

- **Test card Stripe:** `4242 4242 4242 4242`, cualquier CVC, fecha futura
- **Usuario de prueba:** crea uno nuevo en cada QA
- **Notion workspace de prueba:** usa uno con ≥ 5 páginas para validar sync
