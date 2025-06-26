
# CEREBRO → NÚCLEO MIGRATION PLAN

## Project Overview
- **Current**: Single app "Cerebro" (internal use)
- **Goal**: Two products sharing code base
  - Cerebro: Memory + Insights only (internal)
  - Núcleo: Full suite including Launch + Build + Automation (commercial)

## Migration Phases

### FASE 1: Mejorar la base actual ✅ COMPLETED
- [x] Fix PDF processing in Memory module
- [x] Implement granular feature flags system
- [x] Create product configuration (Cerebro vs Núcleo)
- [x] Admin dashboard for feature control

### FASE 2: Estructurar para escalabilidad ✅ COMPLETED
- [x] Database product configuration
- [x] Access control based on product type
- [x] Route protection with ProtectedRoute component
- [x] Enhanced feature flags hook

### FASE 3: Desarrollar módulos exclusivos de Núcleo ✅ IN PROGRESS
- [x] Launch Page: Voice onboarding + AI strategy (placeholder)
- [x] Build Page: Enhanced AutoDev with insights integration (placeholder)
- [x] **NEW: Automation Page: n8n integration for workflow automation**
- [ ] External APIs integration (Whisper, Meta, Google Ads, Lovable)

### FASE 4: Separación limpia - PENDING
- [ ] Independent deployments
- [ ] Differentiated branding
- [ ] Complete testing of both products

## NEW: N8N AUTOMATION ENGINE
- **Embedded n8n interface** dentro de la aplicación
- **Panel de automation** visible en dashboard principal
- **API workflows** configurables desde UI
- **Meta/Google Ads automation** via n8n
- **Voice → Strategy → Campaign** automation pipeline
- **Arquitectura monorepo** mantenida con automation layer agregado

## Technical Achievements
- ✅ Granular feature flags per module
- ✅ Same codebase, different feature access
- ✅ Non-technical admin control
- ✅ Scalable architecture for future separation
- ✅ N8n integration for automation workflows
- ✅ Protected routes based on feature flags
