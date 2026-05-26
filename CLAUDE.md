# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

@AGENTS.md

## Proyecto

**Trivai** es una app móvil social de descubrimiento para Santa Cruz de la Sierra, Bolivia. Esta es la versión **Expo (React Native)** que replica la versión web Next.js ubicada en `../trivai/`. Comparten el mismo backend Supabase.

## Comandos

```bash
npx expo start          # Inicia el servidor de desarrollo (QR para Expo Go)
npx expo start --android  # Emulador Android
npx expo start --ios      # Simulador iOS (solo macOS)
npx expo start --web      # Versión web (limitada)
```

No hay tests automatizados. Verificar cambios manualmente en Expo Go.

## Variables de entorno

En `.env.local`:

| Variable | Propósito |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key |

Las variables `EXPO_PUBLIC_*` son las equivalentes a `NEXT_PUBLIC_*` de Next.js — accesibles en cliente.

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
| Google Maps JS (`@vis.gl/react-google-maps`) | `react-native-maps` (pendiente instalar) |
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

Las categorías Supabase son las mismas que en la web: `'Restaurante'`, `'Cafetería'`, `'Gastronomía'`, `'Arte y cultura'`, `'Arte'`, `'Música'`, `'Entretenimiento'`, `'Parque'`. `'Entretenimiento'` se trata como eventos. Los helpers `getCatEmoji(cat)` y `getCatColor(cat)` están en `lib/tokens.ts`.

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
