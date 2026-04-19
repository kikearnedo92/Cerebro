# Cerebro — Spec de Super Admin

> Qué tiene que poder hacer Kike como super-admin, para que cualquier Claude que implemente `/admin` tenga guía clara.

---

## Acceso

- Ruta: `/admin/*`
- Solo accesible si `profiles.is_super_admin = TRUE`. Cualquier otro user → redirect a `/app/chat`.
- Actualmente el único super-admin es Kike (email: eduardoarnedog@gmail.com). Se puede agregar otro vía SQL directo.

---

## Secciones del panel

### 1. Dashboard (`/admin`)

Vista tipo bird's-eye. Cards con:
- **# Tenants totales** (activos vs. pausados)
- **# Users totales**
- **MRR estimado** (suma de tenants con `subscription_active=true` multiplicado por precio del plan)
- **Queries este mes** (suma de `usage_counters` mes actual)
- **Docs indexados totales**
- **Errores de sync recientes** (integraciones con `sync_status='error'`)

Tabla: últimos 10 tenants creados, últimos 10 eventos (signups, pagos, errores).

### 2. Lista de tenants (`/admin/tenants`)

Tabla con columnas:
- Nombre
- Subdomain
- Plan (Starter / Growth / Enterprise / Internal)
- Estado (Activo / Pausado / Trial)
- Users (# actual / max)
- Queries este mes (# / max_monthly_queries)
- Storage usado (# GB / max_storage_gb)
- Última actividad
- Acciones: **Editar**, **Pausar/Reactivar**, **Impersonar**, **Eliminar** (peligroso, confirmación doble)

Filtros:
- Por estado
- Por plan
- Por fecha de creación
- Por búsqueda texto (nombre/subdomain/admin_email)

### 3. Detalle de tenant (`/admin/tenants/:id`)

Tabs:

**Overview:**
- Nombre, subdomain, custom domain, plan, estado subscription
- Admin email
- Fecha de creación
- Trial ends at (si aplica)
- Stripe customer ID (si existe)

**Users:**
- Lista de profiles con `tenant_id = :id`
- Acciones por user: cambiar rol, desactivar, eliminar, reset password

**Usage:**
- Gráfica de queries por mes (últimos 6 meses)
- Gráfica de docs indexados por mes
- Top 10 queries del mes

**Integrations:**
- Estado de cada integration connection (Notion, Slack, etc.)
- Última sync, items sincronizados, errores
- Botón "Forzar re-sync"

**Settings:**
- Editar nombre
- Editar subdomain (con advertencia — cambia URL)
- Cambiar plan manualmente (Starter → Growth sin pagar, para uso interno)
- Cambiar `max_users`, `max_monthly_queries`, `max_storage_gb` (limits personalizados)
- Pausar/Reactivar (cuando pausado, todos los users del tenant ven mensaje "Tu organización está pausada, contacta a tu admin")
- Marcar como `is_internal=true` (tenants de Retorna u otros casos especiales)

**Billing:**
- Ver histórico de Stripe (cuando se integre)
- Marcar subscription manualmente activa/inactiva (casos especiales)

### 4. Crear tenant manualmente (`/admin/tenants/new`)

Form:
- Nombre
- Subdomain (único)
- Plan
- Admin email (se crea user con invitación automática)
- `max_users`, `max_monthly_queries`, `max_storage_gb` (opcional, heredan del plan)
- `is_internal` (checkbox)

Click "Crear" → crea row en `tenants` + envía invitación al admin_email.

### 5. Usuarios (`/admin/users`)

Vista cross-tenant de todos los users del sistema:
- Email, tenant, rol, último login
- Buscar por email
- Click → ver perfil detalle con historial

### 6. Integrations status (`/admin/integrations`)

Vista cross-tenant del health de todas las integraciones:
- Lista de todas las `integrations` connected
- Filtrar por provider y por status
- Ver errores recientes por provider
- Útil para debugging (ej: "Notion sync falla en 3 tenants, probablemente token expirado")

### 7. Audit log (`/admin/audit`)

Log de eventos importantes:
- Signups, login, pagos
- Integraciones conectadas/desconectadas
- Cambios de plan
- Tenants pausados/eliminados
- Impersonation (quién impersonó a quién y cuándo)

Filtros por tipo, tenant, user, rango de fechas.

### 8. Config global (`/admin/settings`)

- Ver env vars que faltan (check interno)
- Feature flags (toggle features experimentales)
- Banners globales (ej: "Mantenimiento el 1 de mayo")
- Gestión de otros super-admins

---

## Impersonación

**Caso de uso:** cliente reporta un bug, Kike entra como si fuera ese user para reproducirlo.

**Flujo:**
1. Super-admin en `/admin/tenants/:id` → click "Impersonar [user]"
2. Backend valida que es super-admin
3. Genera session token temporal (1h) con el `user_id` impersonado
4. Redirige a `/app/chat` con banner amarillo arriba: "⚠️ Estás impersonando a user@email.com — [Salir]"
5. Todas las acciones se registran en audit log como `impersonated_by: super_admin_id`

---

## Permisos RLS necesarios (ya en migration 2026-04-19)

Ver `supabase/migrations/20260419000000_multi_tenant_hardening.sql`:
- `"Super admins view all tenants"` en `tenants`
- `"Super admins update tenants"` en `tenants`
- `"Super admins create tenants"` en `tenants`
- `"Super admins view all profiles"` en `profiles`

---

## Endpoints API esperados

Todos bajo `/api/admin/*`, todos requieren header Auth Bearer con token de super-admin:

- `GET /api/admin/tenants` — lista con filtros
- `POST /api/admin/tenants` — crear
- `GET /api/admin/tenants/:id` — detalle
- `PATCH /api/admin/tenants/:id` — editar
- `POST /api/admin/tenants/:id/pause`
- `POST /api/admin/tenants/:id/resume`
- `DELETE /api/admin/tenants/:id` — soft delete (set `is_archived=true`, no borra data)
- `POST /api/admin/tenants/:id/impersonate` — genera token temporal
- `GET /api/admin/users` — cross-tenant
- `GET /api/admin/audit` — eventos

Cada endpoint valida `is_super_admin=true` en el profile del token. Si no → 403.

---

## UI framework

Mantener consistencia con el resto de la app:
- shadcn/ui components
- Tailwind colors (primary: indigo-600)
- Iconos de lucide-react
- Sidebar aparte del sidebar de la app normal (indica claramente que estás en zona admin)
