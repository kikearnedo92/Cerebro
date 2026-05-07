# Cerebro · Security Posture

> Estado de seguridad de Cerebro al 7 de mayo de 2026.
> Este documento es público (en repo) e incluye el plan de mejora.

---

## Modelo de amenazas (top 5)

| # | Amenaza | Mitigación actual | Estado |
|---|---|---|---|
| 1 | Cross-tenant data leak | RLS estricta + helpers `is_super_admin/get_user_tenant` | ✅ |
| 2 | Token OAuth compromiso | AES-256-GCM cifrado en reposo + service role no expuesta | ✅ |
| 3 | API key MCP compromiso | SHA-256 hash, no plaintext, scopes limitados, revocable | ✅ |
| 4 | SQL injection en RPC | Funciones `SECURITY DEFINER` con validación de tenant + DRIVE_ID_PATTERN | ✅ |
| 5 | DoS al worker | Constant-time auth check, rate limit Voyage/Anthropic | ⚠️ parcial |

## Cifrado

### En tránsito
- **TLS 1.3** end-to-end (Vercel + Supabase + edge functions)
- HSTS via Vercel headers

### En reposo
- **AES-256-GCM** para tokens OAuth (Google, Notion, Slack)
- Cifrado de disco gestionado por Supabase (AWS RDS)
- Vault para `TOKEN_ENCRYPTION_KEY` (rotación cada 12 meses recomendada)

### En procesamiento
- Embeddings se calculan en Voyage (USA) y se reciben de vuelta — el contenido sale del workspace pero NO se usa para entrenamiento (TOS de Voyage)
- Claude (Anthropic) procesa queries — NO se usa para entrenamiento (TOS Anthropic)

## Aislamiento por tenant

Toda tabla con datos del cliente tiene RLS estricta:

```sql
-- Ejemplo: knowledge_base
CREATE POLICY "tenant_isolation" ON knowledge_base
  FOR ALL TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
```

Tablas con RLS + tenant_id:
- `profiles`
- `tenants`
- `integrations` (incluye tokens cifrados)
- `knowledge_base`
- `drive_sync_queue`
- `tenant_api_keys`
- `api_key_usage`
- `waitlist`
- `messages`
- `conversations`

## Autenticación

### Usuarios humanos
- Supabase Auth (email + password)
- Password hasheado con bcrypt (gestionado por Supabase)
- JWT corto (1h) + refresh token
- Roles: `user` / `admin` / `super_admin` (`role_system` column en profiles)
- Solo `eduardoarnedog@gmail.com` es super_admin

### Servidores y agentes
- `WORKER_AUTH_TOKEN` shared secret entre Supabase + GitHub Actions (constant-time comparison)
- `SUPABASE_SERVICE_ROLE_KEY` solo en backend, nunca al frontend

### MCP server (agentes externos)
- API keys con prefix `cb_live_`
- SHA-256 hash en DB, plaintext nunca persiste
- Reveal-once UX
- Scopes limitados (`query_context`, `list_sources`)
- Rate limit por key (`rate_limit_per_minute` column)

## Logs y auditoría

| Tabla | Qué se loguea | Retención |
|---|---|---|
| `api_key_usage` | tool, query, latency, status | 90 días |
| Edge Function logs | Errores, accesos | 7 días (Supabase free tier) |
| Vercel logs | Requests HTTP | 24 horas (Hobby tier) |
| `drive_sync_queue` | Status + error_message por archivo | 7 días tras `done` |

## Brechas conocidas / debt

🟡 **Sin penetration test externo** — pendiente al alcanzar 50+ clientes empresariales.
🟡 **Sin SOC2** — pendiente Sprint 7+ ($8-15K USD costo).
🟡 **TOKEN_ENCRYPTION_KEY rotación manual** — automatizar en Sprint 6.
🟡 **No hay 2FA en cuentas usuarios** — Supabase Auth lo soporta nativo, falta UI exponerlo. Sprint 5.
🟡 **Logs frontend no se centralizan** — hoy van a console.log. Pendiente Sentry / Logflare.
🟡 **No hay backup en otro provider** — solo backups Supabase (1 región). Pendiente.

## Privacy & GDPR

- [x] Política de Privacidad publicada (`/privacy`)
- [x] Términos de Servicio publicados (`/terms`)
- [x] DPA template para clientes empresariales (`docs/DPA_TEMPLATE.md`)
- [x] Cookie banner con consent diferenciado
- [x] Mecanismo de export de datos (manual via SQL hasta sprint 5)
- [x] Mecanismo de eliminación (manual via super-admin hasta sprint 5)
- [ ] **Self-service data export** (UI) — Sprint 5
- [ ] **Self-service account deletion** (UI) — Sprint 5
- [ ] **Audit log para data subject requests** — Sprint 5

## Sub-procesadores autorizados

Lista completa pública en `/privacy`. Sin cambios sin notificación de 14 días.

| Proveedor | Servicio | Datos compartidos |
|---|---|---|
| Supabase | Auth + DB + Storage | Todo el contenido del workspace |
| Vercel | Hosting frontend + serverless | Requests HTTP, IP |
| Anthropic | LLM (Claude) | Texto de queries + contexto recuperado |
| Voyage AI | Embeddings | Título + contenido de cada doc al embedear |
| GitHub | Crons + agentes IA internos | Solo metadata, no contenido cliente |

## Plan de mejora

### Sprint 5 (próxima semana)
- [ ] Self-service data export en UI (`/app/settings`)
- [ ] Self-service account deletion en UI
- [ ] 2FA opcional para users (TOTP)

### Sprint 6
- [ ] Rotación automática de TOKEN_ENCRYPTION_KEY
- [ ] Sentry para error tracking frontend + backend
- [ ] Backup adicional cross-region

### Sprint 7+
- [ ] Penetration test externo (~$3K USD via Cobalt o HackerOne)
- [ ] SOC2 Type 1 ($8-15K USD via Vanta o Drata)
- [ ] BYOC (bring-your-own-cloud) tier para enterprise

## Reportar vulnerabilidades

Si encuentras una vulnerabilidad: **hola@usacerebro.com** con asunto
`[security] <descripción corta>`. Respondemos en menos de 24h.

No usamos bug bounty público todavía. Si tu reporte es válido, te
agradecemos en el changelog público.

---

_Mantenido por Memo + Compliance Agent. Última revisión: 2026-05-07._
