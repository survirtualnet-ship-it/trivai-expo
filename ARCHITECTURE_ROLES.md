# Arquitectura de roles y permisos — Trivai

Documento generado tras la reestructuración del modelo de usuarios vs negocios.  
**Fuente de lugares:** Google Maps / Places API. **Supabase:** solo enriquecimiento Trivai.

**Suscripciones empresa (detalle):** ver [`BUSINESS_SUBSCRIPTIONS.md`](./BUSINESS_SUBSCRIPTIONS.md).

---

## 1. Principios

| Principio | Implementación |
|-----------|----------------|
| No base global de lugares | `services/places.service.ts` — discovery vía Google |
| Negocios ≠ usuarios | Entidad `Business` en `lib/domain/business.ts` |
| Invitado ≠ rol | Sin sesión = exploración anónima; no hay `User` ni `role: guest` |
| Empresa explora como turista | Mismos tabs Inicio/Mapa/Actividad/Perfil + tab **Mi Negocio** |
| Admin fuera de la app móvil | Tipos en `lib/domain/admin.ts`; sin rutas Expo |
| **Claim ≠ Suscripción** | Reclamar da propiedad; el plan activa herramientas |

---

## 2. Usuarios (`lib/domain/user.ts`)

### Invitado anónimo

- **No** tiene registro en `profiles`.
- **No** tiene `UserRole`.
- Permisos: `lib/domain/permissions.ts` — funciones `guestCan*`.
- Navegación: `isPublicBrowsePath()` en `lib/appBootstrap/resolveDestination.ts`.

### Turista (`role: 'tourist'`)

- DB: `profiles.account_type = 'personal'`.
- Puede: reseñas, favoritos, amigos, actividad, notificaciones, preferencias locales.
- Puede **iniciar** claim flow → pasa a usuario Empresa tras reclamar y elegir plan.

### Empresa (`role: 'business'`)

- Usuario autenticado con permisos empresariales — **no** es el negocio.
- DB: `profiles.account_type = 'business'`.
- Puede administrar **uno o varios** negocios (`trivai_business.owner_id`).
- `profiles.business_place_id` = negocio **activo/primario** (compatibilidad legacy `companyId`).
- Lista completa: `fetchOwnedBusinessesEnriched()` + hook `useOwnedBusinessesList()`.

### Administrador (`role: 'admin'`)

- Reservado para **BackOffice web** futuro.
- `assertNotMobileAdmin()` en `AuthGuard` — warning si aparece en cliente móvil.
- Permisos: `AdminPermission` en `lib/domain/admin.ts`.

### Alias legacy

- `'company'` → normalizado a `'business'` vía `normalizeUserRole()`.
- `companyId` en stores → alias de `activeBusinessId`.

---

## 3. Negocios (`lib/domain/business.ts`)

Los negocios viven en Supabase como **cáscara de enriquecimiento** ligada a Google:

| Campo DB | Dominio |
|----------|---------|
| `places.id` | `Business.id` |
| `google_place_id` | `Business.googlePlaceId` |
| `trivai_business.owner_id` | `Business.ownerUserId` |
| `claim_status` | `unclaimed` \| `claimed` (legacy: `identified`) |
| `subscription_status` | **`none` \| `free` \| `pro` \| `premium`** (legacy: `active`, `expired`, `cancelled`) |
| `claimed_at` | Timestamp del claim |
| `subscription_started_at` | Cuando se eligió plan |
| `subscription_expires_at` | Reservado billing (nullable) |
| `subscription_plan` | Legacy uppercase: `FREE` \| `PRO` \| `PREMIUM` |
| `verification_status` | `unverified` \| `pending` \| `verified` |

### Claim vs Suscripción

| Concepto | Qué significa | Cuándo se asigna |
|----------|---------------|------------------|
| **Claim** | El usuario demostró ser dueño del negocio | Tras `claimBusiness()` — `claim_status = claimed`, `subscription_status = none` |
| **Suscripción** | Plan Trivai elegido (sin pago aún) | Tras `/empresa/plan` — `subscription_status = free\|pro\|premium` |

**Importante:** el Claim **no** abre el dashboard. Solo la suscripción (tier ≠ `none`) habilita herramientas según el plan.

### Estados de ciclo de vida

```
Google Maps → Identificado → Claim → Verificación → Reclamado → Elegir plan → Suscripción activa → Dashboard
```

| Fase | Condición |
|------|-----------|
| **identified** | Google conoce el lugar; sin `owner_id` o `claim_status = unclaimed` |
| **claimed** | `claim_status = claimed` + `ownerUserId`; tier puede ser `none` |
| **subscription_active** | Tier `pro` o `premium` |
| **verified** | `verification_status = verified` (preparado, sin lógica UI) |

Mapper: `mapTrivaiBusinessRow()` — normaliza legacy `active` + `subscription_plan` → tier.

### SQL

Aplicar en Supabase (después de `hybrid-places.sql`):

```
supabase/business-lifecycle.sql
```

---

## 4. Autenticación y AuthGuard

### Flujo

```
Splash → ¿sesión?
  NO  → Invitado (browse público, /welcome para auth)
  SÍ  → legal → onboarding → leer rol → /(tabs)/
```

### Archivos

| Archivo | Rol |
|---------|-----|
| `components/AuthGuard.tsx` | Protección global |
| `hooks/useAppBootstrap.ts` | Estado bootstrap + `activeBusinessId` |
| `lib/appBootstrap/resolveDestination.ts` | Destinos puros; `/empresa/plan` en flujo negocio |
| `hooks/usePermissions.ts` | Contexto permisos UI |

**No** se creó rol `guest`. Ausencia de sesión = invitado anónimo.

---

## 5. Navegación

### Tabs turista

Inicio · Actividades · Mapa · Perfil

### Tabs empresa

Inicio · Actividades · Mapa · Perfil · **Mi Negocio**

- Tab condicional: `app/(tabs)/_layout.tsx` — `href: null` si `!isBusinessUser`.
- Pantalla: `app/(tabs)/mi-negocio.tsx` → `MyBusinessScreen`.
- **No** se bloquea Inicio ni Mapa.

### Modo UI empresa

- `AppModeToggle`: Explorar ↔ Mi negocio (estado global `src/appMode/`).
- No sustituye la navegación por tabs.

---

## 6. Claim flow (separado de suscripción)

1. Place detail — `ClaimBusinessBanner`: *"Este negocio aún no ha sido reclamado"*.
2. Login si hace falta.
3. `/empresa/onboarding/*` — búsqueda Google, verificación, setup.
4. **Done** — `claimBusiness()`:
   - `claim_status = claimed`
   - `subscription_status = none` (sin plan aún)
   - **No** redirige al dashboard
5. **`/empresa/plan`** — elige FREE / PRO / PREMIUM (sin pagos).
6. `updateBusinessSubscription()` persiste tier en Supabase.
7. `completeBusinessOnboarding()` → panel `/empresa/[id]`.

**Multi-negocio:** tab **Mi Negocio** lista todos los locales; negocios con tier `none` abren `/empresa/plan`.

---

## 7. Suscripciones y restricciones por plan

Sin integración de pagos. Persistencia vía `updateBusinessSubscription()` en `lib/business/businessPlan.ts`.

Gating centralizado: `lib/business/planFeatures.ts` + hook `useBusinessSubscription()`.

| Tier | Funciones |
|------|-----------|
| **none** | Solo gate: *"Debes elegir un plan"* → `/empresa/plan` |
| **free** | Editar datos básicos, horarios, contacto, responder reseñas |
| **pro** | Todo free + dashboard, estadísticas, productos, menú, promociones, galería |
| **premium** | Todo pro + campañas, analítica avanzada, IA (placeholder) — arquitectura preparada |

UI bloqueada muestra `UpgradePrompt` con mensaje *"Disponible en plan Pro/Premium"*.

Helpers: `canUseBusinessFeature()`, `canAccessDashboard()`, `canEditProducts()`, `tabAllowedForTier()` — ver `BUSINESS_SUBSCRIPTIONS.md`.

---

## 8. Estadísticas (preparado)

`lib/domain/analytics.ts`:

- **Anónimas:** impresiones, clics, búsquedas, taps WhatsApp/web/teléfono.
- **Autenticadas:** favoritos, reviews, actividad, claim complete.

Stubs `trackAnonymousEvent` / `trackAuthenticatedEvent` — solo log en `__DEV__`.

---

## 9. Permisos (`lib/domain/permissions.ts`)

Matriz centralizada. Usar `usePermissions()` en componentes.

Ejemplos:

- `guestCanWriteReview()` → false
- `userCanStartClaimFlow()` → requiere auth
- `businessUserCanManageBusiness(ctx, business)` → owner match + tier según feature

---

## 10. Archivos clave

### Dominio y planes

- `lib/domain/business.ts` — tipos, normalización legacy, lifecycle
- `lib/business/planFeatures.ts` — matriz feature → tier mínimo
- `lib/business/planOptions.ts` — tarjetas FREE / PRO / PREMIUM
- `lib/business/businessPlan.ts` — `updateBusinessSubscription()`
- `hooks/useBusinessSubscription.ts` — tier por `placeId`

### UI

- `app/empresa/plan.tsx` — pantalla elegir plan (post-claim)
- `src/company/screens/ChoosePlanScreen.tsx` — componente reutilizable
- `src/company/components/SubscriptionRequiredGate.tsx` — tier `none`
- `src/company/components/UpgradePrompt.tsx` — feature bloqueada
- `src/company/CompanyProfileScreen.tsx` — gating por tier
- `src/company/components/ProfileTabs.tsx` — tabs filtrados por plan

### Claim

- `lib/places/claimBusiness.ts` — claim sin activar suscripción
- `onboarding/screens/business/DoneScreen.tsx` → `/empresa/plan`

---

## 11. Compatibilidad

- **`companyId`** sigue funcionando en stores y navegación legacy.
- **`account_type`** en Supabase sin cambio de valores (`personal` / `business`).
- **`subscription_status = active`** + `subscription_plan` se mapean a tier vía `normalizeSubscriptionTier()`.
- **`claim_status = identified`** se trata como legacy de `unclaimed`.
- Dashboard empresa, mapa, place detail, login y onboarding **sin eliminar rutas**.
- `/empresa/onboarding/plan` redirige a `/empresa/plan`.

---

## 12. Próximos pasos recomendados

1. Ejecutar `supabase/business-lifecycle.sql` en producción (ampliar constraints de tier).
2. Integración de pagos para PRO / PREMIUM.
3. Wire analytics stubs a Supabase o proveedor.
4. BackOffice web consumiendo `AdminRole` / `AdminPermission`.
5. Verificación manual post-deploy en Vercel: claim → plan → dashboard gating.
