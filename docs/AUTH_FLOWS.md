# Cerebro — Flujos de autenticación

Spec completo de cómo funcionan signup, login, forgot password, invitaciones y gestión de cuenta.

---

## Stack de auth

- **Supabase Auth** como provider (email/password)
- `profiles` table extiende `auth.users` con `tenant_id`, `role_system`, `is_super_admin`
- Trigger `handle_new_user()` crea profile automáticamente al signup (ver migration 2026-04-19)
- Multi-tenant: cada profile pertenece a UN tenant. Primer user de un signup nuevo crea su propio tenant y es `admin` de ese tenant.

---

## 1. Signup self-serve (nuevo cliente)

**Ruta:** `/auth` → tab "Crear cuenta"

**Form:**
- Nombre completo
- Nombre de la empresa (opcional, autocompletado de email si se omite)
- Email
- Password (mínimo 8 caracteres, Supabase lo valida)
- Checkbox: acepto términos y privacidad

**Flujo:**
1. Usuario envía form
2. Frontend llama `supabase.auth.signUp({ email, password, options: { data: { full_name, company_name } } })`
3. Supabase crea row en `auth.users` + envía email de confirmación al user
4. Trigger `handle_new_user` crea:
   - `tenants` nuevo con `name = company_name`, `subdomain = slug del email + id corto`, `plan = 'starter'`
   - `profiles` con `tenant_id = nuevo`, `role_system = 'admin'` (primer user)
5. Pantalla: "Te mandamos un correo a {email}. Haz click en el link para confirmar."
6. Usuario abre email → click link → Supabase verifica, redirect a `/auth/confirmed`
7. `/auth/confirmed` muestra mensaje claro + botón "Ir a Cerebro" → `/app/chat`

**Configuración Supabase crítica:**
- Site URL: `https://cerebro-ivory.vercel.app`
- Redirect URLs: `https://cerebro-ivory.vercel.app/**`
- Email template de confirmación: customizar para reforzar branding Cerebro (no el default de Supabase)

---

## 2. Signup por invitación (otro miembro del tenant)

**Flujo previo:** tenant admin invita email desde `/app/users/invite` → crea `tenant_invitations` row con token + manda email con link `https://cerebro-ivory.vercel.app/auth?invitation=TOKEN`

**Ruta invitado:** `/auth?invitation=abc123` → tab "Crear cuenta" pre-seleccionada

**Form:**
- Email (pre-filled, read-only, viene de la invitación)
- Nombre
- Password
- Sin campo de empresa (hereda del tenant que invita)

**Flujo:**
1. Frontend valida el token llamando `/api/auth/validate-invitation?token=abc123`
2. Si token válido y no expirado: muestra form con email pre-filled + banner "Te invitaron a {tenant.name}"
3. Usuario envía form: `supabase.auth.signUp({ email, password, options: { data: { full_name, invitation_token: 'abc123' } } })`
4. Trigger `handle_new_user` detecta `invitation_token` en metadata:
   - Lee `tenant_invitations` por token
   - Crea `profiles` con `tenant_id = invitation.tenant_id`, `role_system = invitation.role`
   - Marca `invitation.accepted_at = now()`
5. Confirmación de email normal → /auth/confirmed → /app/chat (ya dentro del tenant del que invita)

---

## 3. Login

**Ruta:** `/auth` → tab "Iniciar sesión"

**Form:** email + password + "¿Olvidaste tu contraseña?" link

**Flujo:**
1. `supabase.auth.signInWithPassword({ email, password })`
2. Si error: "Email o contraseña incorrectos" (sin revelar cuál falla — no filtrar existencia de cuentas)
3. Si éxito: redirect a `/app/chat`
4. El hook `useAuth` mantiene la sesión en React context

---

## 4. Forgot password

**Ruta:** `/auth/forgot`

**Form:** email

**Flujo:**
1. `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://cerebro-ivory.vercel.app/auth/reset' })`
2. Pantalla: "Si tu email existe en Cerebro, te enviamos instrucciones" (no confirmar existencia)
3. Supabase envía email con link
4. Usuario click → aterriza en `/auth/reset?access_token=...`
5. `/auth/reset`: form con nueva password (2 veces)
6. `supabase.auth.updateUser({ password: newPassword })`
7. Éxito → redirect a `/app/chat` (ya logueado automáticamente)

---

## 5. Logout

**Acción:** botón en el perfil/sidebar

**Flujo:**
1. `supabase.auth.signOut()`
2. Redirect a `/` (landing)

---

## 6. Session persistence

- Supabase guarda el session token en `localStorage` (por default)
- Refresh token se rota automáticamente
- Al abrir la app, `useAuth` hook hace `supabase.auth.getSession()` y valida
- Si expiró: redirect a `/auth`

---

## 7. Verify email (ya confirmado)

Si un user ya confirmó email pero vuelve a hacer click en el link viejo:
- `/auth/confirmed` debe manejar gracefully: "Tu cuenta ya está verificada, [Ir a Cerebro]"

---

## 8. Email templates (customizar en Supabase)

Ruta: Supabase dashboard → Authentication → Email Templates

**Confirm signup:**
```
Subject: Bienvenido a Cerebro — confirma tu email

Hola {{ .Data.full_name }},

Gracias por crear tu cuenta en Cerebro. Para activarla, haz click aquí:

{{ .ConfirmationURL }}

Si no fuiste tú, ignora este email.

— El equipo de Cerebro
```

**Reset password:**
```
Subject: Recupera tu contraseña de Cerebro

Hola,

Recibimos una solicitud para resetear tu contraseña. Si fuiste tú, haz click aquí:

{{ .ConfirmationURL }}

Este link expira en 1 hora. Si no fuiste tú, ignora este email.

— El equipo de Cerebro
```

**Invite user:**
Enviado NO por Supabase (no soporta invitaciones multi-tenant). Se manda via Resend/SendGrid desde `/api/invitations/send.js`.

```
Subject: {{ invitedBy.name }} te invitó a Cerebro

Hola,

{{ invitedBy.name }} te invitó a unirte al espacio de {{ tenant.name }} en Cerebro.

Cerebro es el "segundo cerebro" de tu empresa — un chat con IA que responde con info de Notion, Slack, Drive y más.

Haz click para aceptar la invitación y crear tu cuenta:

https://cerebro-ivory.vercel.app/auth?invitation={{ token }}

Este link expira en 7 días.

— El equipo de Cerebro
```

---

## 9. Seguridad

- Passwords nunca en logs ni en frontend state más allá del form
- Tokens de Supabase en `localStorage` — aceptable para MVP (HTTPS-only)
- Rate limiting del `/auth/forgot` (Supabase built-in: 1 email cada 60s por email)
- `tenant_invitations.expires_at` = 7 días. Después, token inválido.
- Email verification obligatoria antes de primer chat (ya lo es por default de Supabase)

---

## 10. Multi-device sessions

Supabase permite múltiples sesiones activas del mismo user (Mac + iPhone). Cada device tiene su refresh token. Si un device hace logout, los otros siguen activos.

Para forzar logout en todos los devices: UI "Cerrar sesión en todos los dispositivos" → `supabase.auth.signOut({ scope: 'global' })`.

---

## Endpoints backend necesarios

| Endpoint | Método | Función |
|---|---|---|
| `/api/auth/validate-invitation` | GET | Valida token antes de mostrar signup form pre-filled |
| `/api/invitations/send` | POST | Manda email de invitación (requiere tenant admin auth) |
| `/api/auth/verify-session` | GET | Verifica session server-side (opcional, útil para SSR) |

El resto de auth lo maneja Supabase directo desde frontend.

---

## UI components necesarios

- `src/pages/AuthPage.tsx` — existe, necesita tabs signup/login + link forgot
- `src/pages/ForgotPasswordPage.tsx` — nueva
- `src/pages/ResetPasswordPage.tsx` — nueva
- `src/pages/EmailConfirmedPage.tsx` — nueva (reemplaza el mensaje de Supabase default)
- `src/hooks/useAuth.ts` — existe, verificar que maneja invitation_token en signup
