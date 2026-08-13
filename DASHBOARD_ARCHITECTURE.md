# Dashboard Empresa — Architecture

**Versión:** 1.0 · Marzo 2026  
**Código:** `lib/analytics/aggregations.ts`, `hooks/useBusinessDashboard.ts`

---

## Propósito

El Dashboard responde:

> **¿Qué hizo Trivai por mi negocio hoy?**

Todas las métricas provienen de **`business_events`**. No hay datos mock en producción.

---

## Capas

```text
Presentation (UI)
  BusinessHomeScreen, DashboardTab
       ↓
Application
  useBusinessDashboard hook
  fetchBusinessDashboard()
       ↓
Domain
  aggregations.ts — métricas, CTR, tendencias
  constants.ts — METRIC_EVENT_MAP, tiers FREE/PRO
       ↓
Infrastructure
  queries.ts — RPC Supabase
  business_events table
```

---

## Cálculo de métricas

### Mapeo métrica → eventos

| Métrica UI | Event types |
|------------|-------------|
| Visualizaciones | VIEW_PLACE, VIEW_BUSINESS |
| Cómo llegar | DIRECTIONS, OPEN_MAP |
| WhatsApp | WHATSAPP_CLICK |
| Llamadas | PHONE_CLICK |
| Clicks Web | WEBSITE_CLICK |
| Favoritos | FAVORITE |
| Reseñas | REVIEW_CREATED |
| Compartidos | SHARE |

Definido en `METRIC_EVENT_MAP` (`lib/analytics/constants.ts`).

### Períodos

| UI | Rango |
|----|-------|
| Hoy | Desde 00:00 local → ahora |
| Esta semana | Últimos 7 días |
| Este mes | Últimos 30 días |

**Comparación:** mismo rango inmediatamente anterior → `changePercent`.

### Stats agregados (`DashboardStats`)

```typescript
{
  views,      // sum VIEW_*
  clicks,     // whatsapp + calls + web + directions
  saves,      // FAVORITE
  rating,     // de places.rating_avg (no de eventos)
  weeklyViews // serie diaria VIEW_* últimos 7 días
}
```

---

## Tiers

### FREE (`dashboard_basic`)

Métricas visibles: **views, directions, whatsapp, favorites, reviews**

### PRO (`dashboard` + `analytics`)

Todas las métricas + gráfico semanal + **CTR contacto** (contactos / views × 100)

### PREMIUM

Arquitectura preparada: `insightsReady`, `hourlyActivity`, comparativas, predicciones — **sin IA en MVP**.

---

## Añadir un indicador nuevo

1. Añadir `BusinessEventType` si hace falta (`constants.ts`).
2. Instrumentar acción turista → `trackPlaceEvent`.
3. Extender `METRIC_EVENT_MAP` o crear métrica derivada en `aggregations.ts`.
4. Añadir key a `FREE_METRIC_KEYS` o `PRO_METRIC_KEYS`.
5. UI: BusinessHomeScreen ya renderiza `metrics[]` dinámicamente.

---

## Business Health Score

**Servicio:** `lib/business/businessHealth.ts`

Inputs: perfil, productos, reseñas, galería, promos, actividad reciente.  
Output: `{ score, maxScore, factors, isPlaceholder: true }`

El Dashboard puede mostrar score cuando UI lo requiera (Fase 4). Algoritmo definitivo pendiente.

---

## Centro de Oportunidades

**Servicio:** `lib/business/businessRecommendations.ts`

Reglas if/then sobre:

- Reseñas sin responder
- Fotos insuficientes
- Descripción corta
- Productos vacíos
- Contacto incompleto

Output: `GrowthRecommendation[]` con impacto, prioridad, deep link.

---

## Asistente de Crecimiento (futuro)

Consumirá:

```text
fetchBusinessDashboard()
calculateBusinessHealthScore()
generateBusinessRecommendations()
fetchRecentBusinessEvents()
```

Feed en Business Home + notificaciones. Sin LLM en Fase 9.

---

## Persistencia de contenido (Sprint 1)

| Entidad | Tabla | Servicio |
|---------|-------|----------|
| Productos | `business_products` | `lib/business/products.ts` |
| Galería | `business_gallery` | `lib/business/products.ts` |
| Reseñas | `reviews` + `review_responses` | `lib/reviews.ts` (única fuente) |
| Perfil editable | `places` | `fromPlace.ts` |

Zustand (`useCompanyProfileStore`) = **caché UI**; carga remota en `loadCompany()`.

---

## Empty states

Sin eventos → métricas en **0**, actividad: *"Sin actividad registrada aún"*.  
No se muestran números sintéticos.

---

## Despliegue checklist

- [ ] SQL `business-analytics.sql` aplicado
- [ ] Eventos visibles en Supabase tras navegar lugares
- [ ] Dashboard owner muestra ceros o datos reales
- [ ] Demo `co-001` solo en `__DEV__`

---

*Documento vivo. Sincronizar con ROADMAP_EMPRESA.md Fases 2–3.*
