# Trivai Design System

Documentación oficial del sistema visual de Trivai. **Toda UI nueva debe consumir exclusivamente estos tokens y componentes.**

## Ubicación

```
src/design/
├── colors.ts       # Paleta oficial
├── spacing.ts      # Escala de espaciado
├── typography.ts   # Jerarquía tipográfica
├── radius.ts       # Radios de borde
├── shadows.ts      # Sombras suaves
├── icons.ts        # Tamaños y colores de iconos (lucide-react-native)
├── components.ts   # Dimensiones de botones, inputs, cards
├── tokens.ts       # Export unificado (T, F, S, R, SHADOW)
├── theme.ts        # Tema light para módulos
└── index.ts        # Barrel export
```

**Import recomendado:**

```typescript
import { T, S, R, F, SHADOW, colors } from '@/src/design'
// o legacy (re-export):
import { T, S, R } from '@/lib/tokens'
```

---

## Colores oficiales

| Token | Hex | Uso |
|-------|-----|-----|
| `colors.primary` / `T.primary` | `#FF7A00` | CTAs, tabs activos, acentos principales |
| `colors.secondary` / `T.secondary` | `#2E7D32` | Éxito, naturaleza, verificado |
| `colors.background` / `T.bg` | `#FAFAFA` | Fondo principal de pantallas |
| `colors.surface` / `T.surface` | `#FFFFFF` | Tarjetas, sheets, inputs |
| `colors.text` / `T.fg1` | `#1A1A1A` | Texto principal |
| `colors.textSecondary` / `T.fg2` | `#5C5C5C` | Subtítulos, metadata |
| `colors.textMuted` / `T.fg3` | `#8E8E93` | Placeholders, hints |
| `colors.border` / `T.border` | `#E8E8E8` | Divisores, bordes de inputs |
| `colors.danger` / `T.danger` | `#D32F2F` | Errores, acciones destructivas |

**Reglas:**
- Nunca usar fondo negro (`#000`, `#0B0F1A`) en pantallas principales.
- Nunca hardcodear hex en JSX — usar tokens.
- Dark mode **no está activo**; la arquitectura de tokens permite añadirlo en el futuro.

---

## Tipografía

Fuente: **Inter** (Roboto/sistema como fallback).

| Estilo | Tamaño | Peso | Uso |
|--------|--------|------|-----|
| Hero | 32px | Bold | Pantallas de bienvenida |
| H1 | 28px | Bold | Títulos de pantalla |
| H2 | 26px | Bold | Secciones principales |
| Title | 17px | Semibold | Títulos de card |
| Subtitle | 15px | Medium | Subtítulos |
| Body | 14px | Regular | Texto normal |
| Caption | 13px | Regular | Metadata, fechas |
| Label | 12px | Semibold | Chips, badges |

Importar pesos via `@/lib/typography` (`FONT.regular`, `FONT.semibold`, etc.).

---

## Espaciado

Escala única — **solo estos valores:**

| Token | px |
|-------|-----|
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `xxxl` | 32 |
| `xxxxl` | 40 |

---

## Bordes (radius)

| Token | px | Uso |
|-------|-----|-----|
| `sm` | 8 | Badges pequeños |
| `md` | 12 | Inputs compactos |
| `lg` | 16 | Botones, chips |
| `xl` | 20 | Tarjetas |
| `xxl` | 24 | Bottom sheets |
| `full` | 999 | Pills, avatares |

Preferir `xl` (20) para tarjetas y `lg` (16) para botones.

---

## Sombras

Sombras **muy suaves** — usar `SHADOW.sm`, `SHADOW.md`, `SHADOW.card`. Nunca sombras exageradas.

---

## Iconografía

- Librería única: **`lucide-react-native`**
- Tamaños: `icons.size.xs` (14) · `sm` (16) · `md` (20) · `lg` (24)
- Grosor: `icons.stroke.default` (2)
- Color contextual: `icons.color.primary`, `.muted`, `.default`

---

## Botones

**Un solo sistema** en `@/components/ui/Button`:

| Componente | Variante | Apariencia |
|------------|----------|------------|
| `PrimaryButton` | `primary` | Naranja `#FF7A00`, texto blanco, h=48px |
| `SecondaryButton` | `secondary` | Borde + fondo blanco |
| `GhostButton` | `ghost` | Solo texto naranja |
| `IconButton` | — | 44×44, circular, borde suave |

```tsx
import { PrimaryButton, SecondaryButton, GhostButton, IconButton } from '@/components/ui'
```

**No crear botones ad-hoc por pantalla.**

---

## Tarjetas

- Fondo: `T.surface` (#FFFFFF)
- Radio: `R.xl` (20)
- Sombra: `SHADOW.card`
- Padding: `S.lg` (16)
- Usar `components/ui/PlaceCard`, `CategoryCard`, `Card`

---

## Formularios

- Input height: 48px (`components.input.height`)
- Radio: `R.lg`
- Borde: `T.border`
- Fondo: `T.surface`
- Componente: `components/ui/AppInput`

---

## Navegación

- Tab bar activo: `colors.primary` (#FF7A00)
- Tab bar inactivo: `colors.textSecondary`
- Fondo tab bar: `colors.surface`
- Headers: `components/ui/AppHeader` o `Header`

---

## Reglas visuales

1. **Consistencia > creatividad** — reutilizar componentes existentes.
2. **Tema claro obligatorio** — no fondos oscuros improvisados.
3. **Mucho espacio en blanco** — respiración entre secciones (`S.xxl`+).
4. **Estilo turístico premium** — limpio, elegante, minimalista.
5. **No parecer dashboard admin** — evitar densidad excesiva y UI oscura.
6. **Funcionalidades nuevas** no pueden introducir colores, botones o cards nuevos sin extender el Design System primero.

---

## Modo oscuro (futuro)

La arquitectura en `src/design/theme.ts` permite añadir `darkTheme` cuando se decida implementarlo. **No usar hasta entonces.**
