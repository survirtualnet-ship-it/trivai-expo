# UI Audit Report — Trivai Expo

Auditoría visual realizada el 13 ago 2026. Objetivo: unificar bajo el Design System oficial (naranja `#FF7A00`, verde `#2E7D32`, tema claro).

## Resumen ejecutivo

| Métrica | Antes | Después |
|---------|-------|---------|
| Sistemas de tokens paralelos | 4+ | 1 (`src/design/`) |
| Implementaciones de botón genérico | 3 | 1 (`components/ui/Button`) |
| Módulos con tema oscuro `#0B0F1A` | 5 | 0 |
| Tab bar accent | Apple blue `#0A84FF` | Trivai orange `#FF7A00` |

---

## Tabla por pantalla

| Pantalla | Estado | Problemas encontrados | Corregido |
| -------- | ------ | --------------------- | --------- |
| Home / Inicio | ✅ | Accent Apple blue `#0A84FF`, tokens `H`/`I` separados | Sí — derivados de `src/design` |
| Mapa | ✅ | Fondo oscuro, mapa Google dark style, `mapTheme` dark | Sí — tema claro + `MAP_LIGHT_STYLE` |
| Buscar | ⚠️ | Parcialmente usa `T.*`; algunos grises sueltos | Parcial — pendiente migración completa |
| Explorar (`explore`) | ✅ | Paleta Apple hardcodeada, chips negros activos | Sí — `T.*` + chips naranja |
| Categorías | ✅ | `categoryTheme` dark `#0B0F1A` | Sí — `lightModuleTheme` |
| Detalle de lugar | ✅ | Ya usaba `T.*` (purple legacy) | Sí — tokens actualizados a naranja |
| Actividad | ✅ | `activityTheme` dark | Sí — tema claro |
| Perfil turista (`profile` tab) | ✅ | `profileTheme` dark | Sí — tema claro |
| Perfil (`perfil/*` tabs) | ✅ | Mayormente `T.bg` light | Sí — tokens unificados |
| Perfil empresa | ✅ | `companyTheme` purple | Sí — naranja/verde oficial |
| Dashboard empresa | ✅ | Alineado con `companyTheme` | Sí |
| Configuración | ✅ | Usa `profileTheme` | Sí — tema claro |
| Login | ✅ | Fondo oscuro onboarding, gradient CTA | Sí — light + `PrimaryButton` naranja |
| Registro | ✅ | Idem login | Sí |
| Onboarding | ✅ | Dark theme, gradient buttons, StatusBar light | Sí |
| Planes | ⚠️ | Usa `src/theme` colors | Parcial — colors re-export design |
| Claim | ✅ | Onboarding light theme | Sí |
| Productos / Galería / Promos | ✅ | `companyTheme` | Sí |
| Eventos | ✅ | `T.bg` light | Sí — accent via tokens |
| Favoritos | ⚠️ | `saved.tsx` importa `lib/theme` | Parcial — `lib/theme` re-exporta design |
| Discover | ✅ | Purple `#6C4CF1` legacy | Sí — naranja via tokens |
| Lugares | ✅ | `T.*` consistente | Sí |
| Amigos | ⚠️ | `#fff` sueltos en CTAs inline | Parcial |
| Legal / Accept | ✅ | Onboarding theme | Sí |

**Leyenda:** ✅ Corregido · ⚠️ Mejorado / pendiente menor · ❌ Sin corregir

---

## Inconsistencias detectadas y resueltas

### Colores
- [x] Purple `#6C4CF1` → Orange `#FF7A00` en tokens globales
- [x] Apple blue `#0A84FF` en tab bar → orange primary
- [x] Dark bg `#0B0F1A` en 5 módulos → `#FAFAFA`
- [x] Explore chips activos `#111` → `T.primary`
- [ ] Algunos `#fff` / `shadowColor: '#000'` en tabs (cosmético, baja prioridad)

### Botones
- [x] `components/Button.tsx` (primary negro) → re-export unificado
- [x] `onboarding/PrimaryButton` gradient → solid orange via `components/ui/Button`
- [x] Variantes: primary, secondary, ghost, danger, IconButton

### Cards
- [x] `components/ui/PlaceCard` es canónico
- [ ] `components/PlaceCard.tsx` legacy (solo explore) — pendiente migrar a ui/PlaceCard

### Headers
- [x] ExploreHeader migrado a tokens
- [ ] Duplicados home/inicio — tokens alineados, componentes aún separados

### Tipografía
- [x] Escala unificada en `src/design/typography.ts`
- [x] Inter via `@/lib/typography`

### Iconografía
- [x] Guía en `src/design/icons.ts`
- [x] lucide-react-native como librería única

### Componentes duplicados identificados

| Legacy | Canónico | Acción |
|--------|----------|--------|
| `components/Button.tsx` | `components/ui/Button` | Re-export ✅ |
| `onboarding/components/PrimaryButton.tsx` | `components/ui/Button` | Re-export ✅ |
| `components/PlaceCard.tsx` | `components/ui/PlaceCard` | Pendiente |
| `lib/theme.ts` | `src/design/` | Re-export ✅ |
| `src/theme/colors.ts` | `src/design/colors.ts` | Derivado ✅ |
| `lib/home/theme.ts`, `lib/inicio/theme.ts` | `src/design/` | Derivado ✅ |
| 5× dark module themes | `lightModuleTheme` | Unificado ✅ |

---

## Archivos clave modificados

- `src/design/*` — Design System nuevo
- `lib/tokens.ts` — re-export oficial
- `src/category|map|activity|profile/theme.ts` — light theme
- `onboarding/lib/theme.ts` — light theme
- `src/company/theme.ts` — paleta oficial
- `components/ui/Button.tsx` — botones unificados
- `app/(tabs)/explore.tsx`, `ExploreHeader`, `CategoryFilter`
- `src/map/mapDarkStyle.ts` → light POI-minimal style

---

## Pendientes (siguiente iteración)

1. Migrar `components/PlaceCard.tsx` (legacy) → `components/ui/PlaceCard`
2. Reemplazar CTAs inline (`ctaBtn`, `emptyBtn`) en tabs por `PrimaryButton`
3. Consolidar `components/home/*` y `components/inicio/*` en componentes ui/
4. Eliminar `#fff` sueltos → `T.surface` / `colors.onPrimary`
5. Migrar `app/(tabs)/buscar` hex restantes
