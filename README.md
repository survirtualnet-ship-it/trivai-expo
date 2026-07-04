# Trivai (Expo)

App móvil y PWA de descubrimiento social para **Santa Cruz de la Sierra**. Comparte backend Supabase con la versión web Next.js en [trivai.vercel.app](https://trivai.vercel.app).

**Producción:** [trivai-expo.vercel.app](https://trivai-expo.vercel.app)

---

## Flujo de trabajo (remoto, sin localhost)

Este proyecto **no se desarrolla en local**. El ciclo es:

```
Cursor → git commit → git push → Vercel (web) + Expo Go (móvil)
```

### 1. Cambios de código

Edita en Cursor, commitea y haz push a `master` en GitHub.

### 2. Probar en web

Vercel despliega automáticamente cada push a `master`.

- URL: **https://trivai-expo.vercel.app**
- El build tarda ~1–3 minutos tras el push.

### 3. Probar en móvil (Expo Go)

Desde la máquina donde corre el servidor de Expo (solo para el túnel, no para servir la app en localhost):

```bash
npx expo start --tunnel
```

- Instala **Expo Go SDK 54** en el teléfono.
- Escanea el QR del túnel.
- Recarga la app en Expo Go cuando actualices código.

> No hace falta abrir `localhost:8081` ni configurar redirect URLs de localhost en Supabase.

### 4. Variables de entorno

Se configuran en **Vercel → Project Settings → Environment Variables** (build time). Plantilla en `.env.example`:

| Variable | Propósito |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key |
| `EXPO_PUBLIC_APP_URL` | URL pública de esta app (default: trivai-expo.vercel.app) |

### 5. Auth (Supabase redirect URLs)

En **Supabase → Authentication → Redirect URLs**:

| URL | Uso |
|---|---|
| `https://trivai-expo.vercel.app/auth/callback` | Web en producción |
| `trivai://auth/callback` | Build nativo |
| `exp://…` (túnel Expo Go) | OAuth en dispositivo vía túnel |

---

## Stack

- Expo SDK 54 + Expo Router
- React Native (iOS, Android, Web)
- Supabase (auth, DB, storage)
- Vercel (deploy web/PWA)
- Google Maps (WebView + Static Maps)

## Scripts útiles

```bash
npx expo start --tunnel   # Expo Go en dispositivo físico
```

Scripts de mantenimiento en `scripts/` (requieren `.env.local` con service role key, solo uso administrativo).

## Documentación para agentes

Ver `CLAUDE.md` para arquitectura, tokens, patrones de componentes y convenciones del repo.
