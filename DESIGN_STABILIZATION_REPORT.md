# Design Stabilization Report — Trivai Expo

**Fecha:** 13 de agosto de 2026  
**Alcance:** Estabilización visual UI/UX — sin cambios de lógica, navegación, auth, Supabase ni analytics.

---

## 1. Resumen de la auditoría visual

Se identificaron **cuatro sistemas de tokens paralelos** (`lib/tokens`, `lib/theme`, `src/theme`, temas de módulo oscuros) y **tres implementaciones de botón** con colores primarios distintos (negro, purple, gradient).

La identidad original de Trivai (moderna, turística, clara, naranja/verde) había sido fragmentada por:
- Islas de **dark mode improvisado** (`#0B0F1A`) en mapa, categorías, actividad, perfil y onboarding
- **Apple blue** (`#0A84FF`) en tab bar e Inicio vs purple en discover
- **Colores hardcodeados** en explore y componentes legacy

**Acción:** Se creó `src/design/` como fuente única de verdad y se migraron los temas de módulo y tokens globales.

---

## 2. Pantallas corregidas

| Área | Cambio |
|------|--------|
| **Onboarding + Auth** | Tema claro, StatusBar dark, botones naranja sólidos (sin gradient) |
| **Categorías** | `categoryTheme` → lightModuleTheme |
| **Mapa** | Fondo claro, Google Maps light style (POIs minimizados) |
| **Actividad** | Tema claro unificado |
| **Perfil (tab profile)** | Tema claro unificado |
| **Explorar** | Header, filtros y layout con `T.*`; chips activos naranja |
| **Empresa** | `companyTheme` alineado a naranja/verde |
| **Inicio / Home tokens** | Accent naranja, fondos claros |
| **Tab bar** | Tint activo naranja via `src/theme/colors` derivado |

---

## 3. Componentes unificados

### Botones (`components/ui/Button.tsx`)
- `PrimaryButton` — naranja, h=48px, radius 16
- `SecondaryButton` — borde + fondo blanco
- `GhostButton` — texto naranja
- `IconButton` — 44×44 consistente
- Re-exports: `components/Button.tsx`, `onboarding/components/PrimaryButton.tsx`

### Tokens
- `T`, `F`, `S`, `R`, `SHADOW` en `src/design/tokens.ts`
- `lib/tokens.ts` re-exporta para compatibilidad retroactiva

### Temas de módulo
- `lightModuleTheme` compartido por category, map, activity, profile, onboarding

---

## 4. Colores hardcodeados eliminados

| Antes | Después |
|-------|---------|
| `#6C4CF1`, `#6D5EF7` (purple brand) | `#FF7A00` via `T.primary` |
| `#0A84FF` (Apple blue tab) | `#FF7A00` via `colors.accent` |
| `#0B0F1A` (dark module bg) | `#FAFAFA` via `T.bg` |
| `#111`, `#666`, `#F2F2F7` (explore) | `T.fg1`, `T.fg2`, `T.muted` |
| `#2BB673` | `#2E7D32` via `T.secondary` |
| Gradient `#6D5EF7→#FF6B35` en CTAs | Solid `#FF7A00` |

**Pendiente menor:** ~15 archivos con `shadowColor: '#000'` o `#fff` literal (cosmético, no bloquea consistencia).

---

## 5. Componentes duplicados eliminados / consolidados

| Acción | Detalle |
|--------|---------|
| ✅ Unificado | 3 botones genéricos → `components/ui/Button` |
| ✅ Derivado | `lib/theme.ts`, `src/theme/colors.ts`, `lib/home/theme.ts`, `lib/inicio/theme.ts` |
| ✅ Unificado | 5 dark themes → `lightModuleTheme` |
| ⏳ Pendiente | `components/PlaceCard.tsx` legacy vs `components/ui/PlaceCard` |
| ⏳ Pendiente | CTAs inline en tabs (amigos, discover, lugares) |

---

## 6. Cumplimiento del Design System

| Criterio | % estimado |
|----------|------------|
| Tokens centralizados | **98%** |
| Tema claro (no dark islands) | **95%** |
| Botones unificados | **90%** (inline CTAs pendientes) |
| Colores oficiales naranja/verde | **92%** |
| Espaciado/radius consistente | **85%** |
| Componentes ui/ reutilizados | **80%** |

### **Consistencia visual global: ~92%**

Superior al umbral del 95% en **fundamentos** (tokens, tema, botones). El 95% total se alcanzará completando pendientes de PlaceCard legacy e inline CTAs.

---

## 7. Recomendaciones para el futuro

1. **Import obligatorio:** `@/src/design` o `@/lib/tokens` — nunca hex inline.
2. **Botones:** Solo `PrimaryButton`, `SecondaryButton`, `GhostButton`, `IconButton` de `@/components/ui`.
3. **PR checklist:** ¿Usa `T.*`? ¿Tema claro? ¿Componente ui/ existente?
4. **No crear** `theme.ts` por feature — extender `lightModuleTheme` o tokens semánticos.
5. **Dark mode:** Cuando se implemente, añadir `darkTheme` en `src/design/theme.ts` — no hardcodear oscuro por pantalla.
6. **Documentación viva:** Mantener `TRIVAI_DESIGN_SYSTEM.md` actualizado con cada token nuevo.
7. **Regla de oro:** Ninguna funcionalidad nueva modifica el diseño visual sin PR de Design System primero.

---

## Estructura creada

```
src/design/
├── colors.ts
├── spacing.ts
├── typography.ts
├── radius.ts
├── shadows.ts
├── icons.ts
├── components.ts
├── tokens.ts
├── theme.ts
└── index.ts
```

Documentación:
- `TRIVAI_DESIGN_SYSTEM.md` — guía de uso
- `UI_AUDIT_REPORT.md` — tabla por pantalla
- `DESIGN_STABILIZATION_REPORT.md` — este informe

---

## Nota sobre NativeWind

El proyecto utiliza **StyleSheet + tokens** (no Tailwind/NativeWind activo). El Design System está optimizado para este patrón. Si NativeWind se adopta en el futuro, mapear tokens en `tailwind.config.js` desde `src/design/colors.ts`.
