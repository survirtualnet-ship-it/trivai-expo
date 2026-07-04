# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

@AGENTS.md

## Proyecto

**Trivai** es una app móvil social de descubrimiento para Santa Cruz de la Sierra, Bolivia. Esta es la versión **Expo (React Native)** que replica la versión web Next.js ubicada en `../trivai/`. Comparten el mismo backend Supabase.

**Producción web/PWA:** https://trivai-expo.vercel.app

## Flujo de trabajo remoto

**No se desarrolla en localhost.** El ciclo oficial es:

1. Editar en Cursor → `git commit` → `git push` a `master`
2. **Vercel** despliega automáticamente → probar en https://trivai-expo.vercel.app
3. **Expo Go** (opcional, móvil): `npx expo start --tunnel` + QR — requiere Expo Go SDK 54

No configurar `http://localhost:8081/auth/callback` en Supabase. Las redirect URLs válidas son:

- `https://trivai-expo.vercel.app/auth/callback` (web producción)
- `trivai://auth/callback` (build nativo)
- `exp://…` del túnel Expo Go (OAuth en dispositivo)

Ver `README.md` para el flujo completo.

## Comandos

```bash
npx expo start --tunnel    # Expo Go en dispositivo (recomendado)
```

No hay tests automatizados. Verificar cambios en Vercel (web) o Expo Go (móvil).

## Variables de entorno

Configurar en **Vercel → Environment Variables** (build time). Plantilla: `.env.example`

| Variable | Propósito |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key |
| `EXPO_PUBLIC_APP_URL` | URL pública (default: trivai-expo.vercel.app) |
| `EXPO_PUBLIC_WEB_API_URL` | Backend Next.js (default: trivai.vercel.app) |

Las variables `EXPO_PUBLIC_*` se embeben en el bundle en build time — deben existir en Vercel antes del deploy.

Validación en runtime: `lib/env.ts` · URLs de share: `lib/appUrl.ts` · Auth redirects: `lib/auth/redirectUrl.ts`

## Arquitectura

### Estructura de archivos

- `app/` — Expo Router (file-based routing, idéntico a Next.js App Router)
  - `_layout.tsx` — Root layout con SafeAreaProvider
  - `(tabs)/` — Navegación por tabs (Inicio, Eventos, Mapa, Amigos, Perfil)
  - `lugares/[id].tsx` — Detalle de lugar (patrón: `router.push('/lugares/UUID')`)
  - `eventos/[id].tsx` — Detalle de evento
  - `auth/` — Login y registro
- `lib/tokens.ts` — **Design system**. Todos los colores (`T.*`), tamaños de fuente (`F.size.*`), espaciados (`S.*`) y radios (`R.*`). Siempre importar de aquí, nunca hardcodear valores inline.
- `lib/supabase.ts` — Cliente Supabase con AsyncStorage + todos los tipos TypeScript (`Profile`, `Place`, `Event`).
- `components/` — Componentes reutilizables.

### Diferencias clave vs la versión web

| Web (Next.js) | App (Expo) |
|---|---|
| CSS / `style={{}}` con objetos JS | `StyleSheet.create()` de React Native |
| `components/ui/trivai.tsx` (design system completo) | `lib/tokens.ts` (tokens) + componentes en `components/` |
| `T.*` colores directos en JSX | `T.*` en `StyleSheet.create()` |
| `Link href="/ruta"` | `router.push('/ruta')` de expo-router |
| `useSearchParams()` | `useLocalSearchParams()` de expo-router |
| Google Maps JS (`@vis.gl/react-google-maps`) | WebView + Google Maps JS (`components/MapEmbed.*`) |
| `next/dynamic` para lazy load | `React.lazy` o importación directa |
| `window.localStorage` | `AsyncStorage` de `@react-native-async-storage` |

### Supabase

El cliente usa `AsyncStorage` para persistir sesiones entre reinicios. Mismo proyecto Supabase que la web — mismas tablas, misma auth, mismas RLS policies. Las llamadas a la API de Google Places se hacen a través de los API routes del proyecto web (`https://trivai.vercel.app/api/google-places`) — no duplicar lógica.

### Navegación (Expo Router)

Tabs: Inicio (`/`), Eventos (`/eventos`), Mapa (`/mapa`), Amigos (`/amigos`), Perfil (`/perfil`).

```typescript
import { router, useLocalSearchParams } from 'expo-router'
router.push('/lugares/UUID')      // navegar
router.back()                     // volver
const { id } = useLocalSearchParams()  // leer params en [id].tsx
```

### Categorías

Fuente única: `lib/categories.ts` — Gastronomía, Entretenimiento, Parques, Otros (+ mapeo legacy). Helpers: `getCatEmoji`, `getCatColor`, `getCatLabel`, `normalizeCategory`.

### Iconos

Usar `lucide-react-native` (mismo que la web usa `lucide-react`). Los iconos reciben `size` y `color` como props.

```typescript
import { MapPin, Star } from 'lucide-react-native'
<MapPin size={16} color={T.purple}/>
```

### Patrones de componentes React Native

```typescript
// Siempre SafeAreaView para pantallas principales
import { SafeAreaView } from 'react-native-safe-area-context'
<SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>

// StyleSheet al final del archivo
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg, padding: S.lg },
})

// ScrollView para listas largas, FlatList para listas dinámicas grandes
```
