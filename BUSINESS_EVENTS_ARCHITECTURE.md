# Business Events — Architecture

**Versión:** 1.0 · Marzo 2026  
**SQL:** `supabase/business-analytics.sql`  
**Código:** `lib/analytics/`

---

## Propósito

Registrar **todas las interacciones turista → negocio** en Trivai como fuente única de verdad para:

- Dashboard Empresa (ROI)
- Business Health Score
- Centro de Oportunidades
- Asistente de Crecimiento
- Promociones contextuales (futuro)
- Benchmark agregado (futuro)

Google Maps sigue siendo la fuente de lugares. Los eventos son **propiedad Trivai** y referencian enriquecimiento via `business_id` (`places.id`) + `google_place_id`.

---

## Modelo de datos

### Tabla `business_events` (append-only)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid | PK |
| `created_at` | timestamptz | Momento del evento |
| `business_id` | uuid | FK → `places.id` |
| `google_place_id` | text | Clave Google (redundancia controlada) |
| `user_id` | uuid nullable | Solo si autenticado; **nunca expuesto al negocio** |
| `anonymous_id` | text nullable | Sesión anónima rotativa (AsyncStorage) |
| `event_type` | text | Catálogo extensible |
| `country` | text | Agregación geográfica |
| `city` | text | Agregación geográfica |
| `metadata` | jsonb | `product_id`, `promo_id`, `source_screen`, etc. |

**Constraint:** `user_id` OR `anonymous_id` debe existir.

### Tabla `business_metrics_daily` (cache opcional)

Agregados diarios por `(business_id, metric_date, event_type)` para consultas rápidas. Población: cron futuro o trigger; MVP agrega en runtime via RPC.

---

## Event Types

Definidos en `lib/analytics/constants.ts` → `BUSINESS_EVENT_TYPES`.

| Evento | Disparador |
|--------|------------|
| `VIEW_PLACE` | Apertura detalle de lugar |
| `VIEW_BUSINESS` | Vista panel negocio (futuro) |
| `OPEN_MAP` | Mapa embebido (futuro) |
| `DIRECTIONS` | Cómo llegar |
| `PHONE_CLICK` | Llamar |
| `WHATSAPP_CLICK` | WhatsApp |
| `WEBSITE_CLICK` | Sitio web |
| `FAVORITE` | Guardar negocio |
| `SHARE` | Compartir |
| `REVIEW_CREATED` | Nueva reseña |
| `REVIEW_RESPONSE` | Respuesta del negocio |
| `PROMOTION_VIEW` | Ver promoción |
| `PROMOTION_CLICK` | Clic promoción |
| `PRODUCT_CLICK` | Clic producto |
| `MENU_VIEW` | Ver menú |

Nuevos tipos: añadir al enum TypeScript + constantes. **No requiere migración** (columna `event_type` es text).

---

## Flujo

```text
Turista (anon o auth)
    → trackBusinessEvent() / trackPlaceEvent()
    → cola en memoria (batch 400ms)
    → INSERT business_events (Supabase)
    → RLS: insert público, read solo owner

Dueño empresa
    → aggregate_business_events RPC
    → fetchBusinessDashboard()
    → Business Home / Dashboard Tab
```

### API pública

```typescript
import { trackBusinessEvent, trackPlaceEvent } from '@/lib/analytics/analytics'

trackPlaceEvent(placeId, googlePlaceId, 'WHATSAPP_CLICK', {
  userId,
  city,
  country,
})
```

---

## Privacidad (Privacy by Design)

- Empresa **nunca** ve `user_id` ni `anonymous_id` en UI.
- Solo agregados y feed de actividad genérico.
- Proximidad futura: celdas geográficas gruesas, sin PII.
- Retención raw recomendada: 90 días (política operativa; no enforced en MVP).

---

## RLS

| Rol | Insert | Select |
|-----|--------|--------|
| `anon` | ✅ eventos | ❌ |
| `authenticated` (turista) | ✅ eventos | ❌ |
| Owner (`trivai_business`) | ✅ | ✅ solo sus `business_id` |

---

## RPCs

| Función | Uso |
|---------|-----|
| `aggregate_business_events(business_id, from, to)` | Conteos por `event_type` |
| `business_events_daily_series(...)` | Gráfico semanal |
| `business_recent_events(business_id, limit)` | Feed actividad |

---

## Escalabilidad

1. **Particionamiento** por mes en `business_events` cuando volumen > 10M filas.
2. **`business_metrics_daily`** poblado por Edge Function nocturna.
3. **Benchmark:** agregar por `(city, category, event_type)` sin identificar negocios en UI.
4. **Multi-país:** columnas `country` + `city` en cada evento.

---

## Instrumentación actual

| Pantalla | Eventos |
|----------|---------|
| `app/place/[id].tsx` | VIEW_PLACE, DIRECTIONS, WHATSAPP, FAVORITE, SHARE, REVIEW_* |
| `useCompanyProfileStore.replyToReview` | REVIEW_RESPONSE |

Pendiente: PHONE_CLICK, WEBSITE_CLICK, PRODUCT_CLICK, PROMOTION_*, MENU_VIEW.

---

## Despliegue

1. Ejecutar `supabase/business-analytics.sql` en Supabase SQL Editor.
2. Verificar RLS con usuario owner y turista anónimo.
3. Abrir detalle de lugar → confirmar filas en `business_events`.
4. Dashboard empresa → métricas en 0 hasta eventos reales.

---

*Documento vivo. Actualizar al añadir eventos o RPCs.*
