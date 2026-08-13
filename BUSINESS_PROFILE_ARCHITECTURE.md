# Business Profile — Architecture

**Versión:** 1.0 · Marzo 2026  
**SQL:** `supabase/business-profile.sql`, `supabase/business-analytics.sql`

---

## Principio híbrido

| Fuente | Datos | Editable en Trivai |
|--------|-------|-------------------|
| **Google** | Nombre, dirección, coords, categoría Google, Place ID | ❌ Solo lectura |
| **Trivai** | Descripción, WhatsApp, productos, menú, galería, horarios, redes, servicios | ✅ |

Google sigue siendo la fuente oficial de **ubicación**. Trivai administra **contenido enriquecido**.

---

## Tablas

### `places` (híbrido existente)

- Campos Google-sync: `name`, `address`, `latitude`, `longitude`, `google_place_id`, `category`
- Campos Trivai-editable: `description`, `phone`, `website`, `hours` (legacy flat map)

### `business_enrichment` (1:1 con place)

WhatsApp, teléfono secundario, email comercial, servicios, idiomas, métodos de pago, accesibilidad, amenities, horarios estructurados (`jsonb`), redes sociales, `google_synced_at`.

### `business_products`

Catálogo Trivai — no duplica Google.

| Campo | Notas |
|-------|-------|
| `place_id` | FK (alias conceptual `business_id`) |
| `name` | título del producto |
| `price`, `currency`, `status`, `sort_order` | Sprint 4 |

### `business_gallery`

Imágenes propias + Storage bucket `business-gallery`. Campos: `is_cover`, `media_type` (preparado para video).

### Menú (restaurantes)

```
business_menu
  └── business_menu_sections
        └── business_menu_items
```

Entidad **independiente** de productos.

### `business_opportunity_dismissals`

Persistencia opcional de oportunidades completadas/descartadas.

---

## Servicios (`lib/business/`)

| Módulo | Responsabilidad |
|--------|-----------------|
| `profile.ts` | Enrichment CRUD, horarios, contacto |
| `products.ts` | CRUD productos |
| `gallery.ts` | Upload/delete/reorder + límites por plan |
| `menu.ts` | Menú + secciones + ítems |
| `googleSync.ts` | Sync campos Google → `places` sin tocar enrichment |
| `planLimits.ts` | Límites numéricos FREE/PRO/Premium |

---

## Sincronización Google

```text
Google Places API refresh
    → syncGooglePlaceFields(placeId, payload)
    → UPDATE places (name, address, phone, coords, category)
    → business_enrichment.google_synced_at = now()
    → enrichment, products, gallery UNTOUCHED
```

Implementar refresh en pipeline híbrido existente (`lib/places/mergePlace.ts`).

---

## Store (caché UI)

`useCompanyProfileStore`:

- Carga remota: products, reviews, gallery, enrichment, menu count
- Persistencia AsyncStorage: solo `companies` (metadata mínima)
- Acciones async: CRUD productos, galería, respuestas reseñas

---

## Límites por plan

| Recurso | FREE | PRO | Premium |
|---------|------|-----|---------|
| Productos | 5 | 50 | 500 |
| Galería | 3 | 20 | 100 |
| Secciones menú | 2 | 10 | 50 |

Enforcement en `gallery.ts` y (pendiente) `products.ts` UI.

---

## Pantallas

| Pantalla | Rol |
|----------|-----|
| `BusinessHomeScreen` | Health + Oportunidades + stats |
| `CompanyProfileScreen` | Edición tabs (productos, galería, reseñas) |
| `BusinessProfileScreen` | Configuración hub |

---

## Campos Google bloqueados en UI

`HomeTab`: nombre y categoría `locked`. Dirección siempre read-only.

---

## Despliegue

1. `business-analytics.sql`
2. `business-profile.sql`
3. Crear bucket Storage `business-gallery` (público lectura, auth write)
4. Verificar RLS owner via `trivai_business`

---

*Documento vivo. No duplicar catálogo Google en Supabase.*
