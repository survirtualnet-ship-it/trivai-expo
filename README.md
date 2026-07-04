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

### 3. Probar en el móvil

#### Opción A — Recomendada (sin PC encendida)

Abre en el navegador del celular:

**https://trivai-expo.vercel.app**

Puedes agregarla a la pantalla de inicio (Safari → Compartir → “Añadir a inicio”; Chrome → menú → “Instalar app”). No requiere Expo Go ni túnel.

#### Opción B — Expo Go (solo si la PC está corriendo el servidor)

1. Instala **Expo Go SDK 54** en Android/iOS.
2. En la PC donde clonaste el repo, ejecuta:

```bash
npm run start:tunnel
```

3. Espera ver `Tunnel ready` en la terminal.
4. Escanea el **QR nuevo** que aparece en la terminal (no uses QR guardados de sesiones anteriores — la URL cambia).
5. O en Expo Go → “Enter URL manually”:

```
exp://mihvlda-anonymous-8081.exp.direct
```

> La URL `exp://…` **solo funciona mientras** `npm run start:tunnel` sigue corriendo en esa PC. Si cierras la terminal o apagas la PC, deja de funcionar.

**Si Expo Go no carga:** cierra Expo Go, vuelve a ejecutar `npm run start:tunnel --clear` y escanea el QR nuevo. Verifica que Expo Go sea SDK 54.

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
npm run start:tunnel   # Expo Go en dispositivo (requiere PC encendida)
```

**Móvil sin PC:** usa https://trivai-expo.vercel.app en el navegador del teléfono.

Scripts de mantenimiento en `scripts/` (requieren `.env.local` con service role key, solo uso administrativo).

## Documentación para agentes

Ver `CLAUDE.md` para arquitectura, tokens, patrones de componentes y convenciones del repo.
