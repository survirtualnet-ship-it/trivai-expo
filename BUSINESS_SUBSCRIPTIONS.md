# Suscripciones Empresa — Trivai

Documento de referencia para el flujo **Claim vs Suscripción**.  
Complementa `ARCHITECTURE_ROLES.md`.

---

## Flujo Empresa

```text
Google Maps
        │
        ▼
Negocio identificado (unclaimed)
        │
        ▼
Reclamar negocio (Claim)
        │
        ▼
Verificación del propietario
        │
        ▼
Negocio reclamado (claimStatus = claimed, subscriptionStatus = none)
        │
        ▼
/empresa/plan — Elegir plan
        │
        ▼
Suscripción activa (free | pro | premium)
        │
        ▼
Panel empresa (/empresa/[id]) — funciones según plan
```

**Regla de oro:** el Claim identifica al propietario. La Suscripción controla el acceso a funcionalidades.

---

## Estados

### Claim (`claim_status`)

| Valor | Significado |
|-------|-------------|
| `unclaimed` | Solo Google Maps; sin propietario Trivai |
| `claimed` | Propietario verificado y asignado |

Legacy: `identified` → tratado como `unclaimed`.

### Suscripción (`subscription_status`)

| Valor | Significado |
|-------|-------------|
| `none` | Reclamado pero sin plan elegido |
| `free` | Plan gratuito |
| `pro` | Plan Pro |
| `premium` | Plan Premium |

Legacy: `active` + `subscription_plan` → mapeado a tier vía `normalizeSubscriptionTier()`.

### Timestamps (Supabase)

| Columna | Cuándo se escribe |
|---------|-------------------|
| `claimed_at` | Al completar `claimBusiness()` |
| `subscription_started_at` | Al elegir plan en `/empresa/plan` |
| `subscription_expires_at` | Reservado para billing futuro (nullable) |

---

## Planes

### FREE

- Reclamar negocio (ya completado antes de elegir plan)
- Editar información básica
- Horarios
- Datos de contacto
- Responder reseñas

**No incluye:** Dashboard, productos, galería, analytics avanzados.

### PRO

Todo Free, más:

- Dashboard
- Estadísticas
- Productos
- Menú
- Promociones
- Galería
- Analytics
- Prioridad en recomendaciones (placeholder)

### PREMIUM

Todo Pro, más (arquitectura preparada, sin implementar UI aún):

- IA (placeholder)
- Campañas
- Automatizaciones
- Reportes avanzados
- Funciones futuras

---

## Permisos

Fuente única: `lib/business/planFeatures.ts`

| Helper | Tier mínimo |
|--------|-------------|
| `canEditBasicInfo()` | free |
| `canAccessDashboard()` | pro |
| `canEditProducts()` | pro |
| `canUseAnalytics()` | pro |
| `canCreatePromotions()` | pro |
| `canUseAI()` | premium |
| `canUseCampaigns()` | premium |

Uso en UI:

```ts
import { canAccessDashboard, canEditProducts } from '@/lib/business/planFeatures'

if (canAccessDashboard(tier)) { /* DashboardTab */ }
```

**Nunca** usar `claimStatus` para gating de features — solo para identificar propiedad (`isBusinessClaimed`).

Persistencia: `updateBusinessSubscription()` en `lib/business/businessPlan.ts`.

---

## Rutas

| Ruta | Propósito |
|------|-----------|
| `/empresa/onboarding/*` | Claim flow |
| `/empresa/plan` | Selector de plan post-claim |
| `/empresa/suscripcion` | Gestión suscripción (redirige a plan por ahora) |
| `/empresa/[id]` | Panel empresa con gating por tier |

---

## UI

### Sin plan (`subscriptionStatus = none`)

Pantalla gate en panel empresa:

> Tu negocio ya fue reclamado.  
> Ahora elige un plan para comenzar.  
> [ Elegir plan ]

### Con plan

Barra en panel empresa:

```
Empresa reclamada
Plan FREE / PRO / PREMIUM
[ Cambiar plan ]  o  [ Administrar suscripción ]
```

Componentes: `SubscriptionRequiredGate`, `BusinessSubscriptionBar`, `ChoosePlanScreen`, `UpgradePrompt`.

---

## Roadmap futuro

1. **Pasarela de pago** — Stripe / Mercado Pago / Apple Pay / Google Pay  
   - Escribir en `subscription_started_at` / `subscription_expires_at`  
   - No cambiar flujo Claim → Plan → Panel  
   - `updateBusinessSubscription()` puede evolucionar a `activatePaidSubscription()`

2. **Verificación manual** — badge verificado (`verification_status`)

3. **Premium features** — campañas, IA, automatizaciones

4. **`/empresa/suscripcion`** — historial, facturas, cancelación

5. **BackOffice** — admin override de planes

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `lib/domain/business.ts` | Tipos, normalización legacy |
| `lib/business/planFeatures.ts` | Matriz de permisos |
| `lib/business/planOptions.ts` | Copy de planes |
| `lib/business/businessPlan.ts` | Persistencia Supabase |
| `lib/places/claimBusiness.ts` | Claim sin activar suscripción |
| `hooks/useBusinessSubscription.ts` | Tier por placeId |
| `supabase/business-lifecycle.sql` | Migración idempotente |

---

## Compatibilidad

- Negocios legacy con `subscription_status = active` → mapeados a `free`/`pro`/`premium`
- Claim existente conserva `owner_id` y `claimed = true`
- Login, OAuth, onboarding, mapa, home y place detail sin cambios de ruta destructivos
