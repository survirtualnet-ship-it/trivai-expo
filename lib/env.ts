/** Variables EXPO_PUBLIC_* — embebidas en build (Vercel / EAS).
 *  Referencias estáticas a process.env: Metro solo inlinea acceso directo, no process.env[name]. */

export const ENV = {
  supabaseUrl:     process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '',
  googleMapsKey:   process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim() ?? '',
  appUrl:          (process.env.EXPO_PUBLIC_APP_URL?.trim() || 'https://trivai-expo.vercel.app').replace(/\/$/, ''),
  webApiUrl:       (process.env.EXPO_PUBLIC_WEB_API_URL?.trim() || 'https://trivai.vercel.app').replace(/\/$/, ''),
} as const

if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
  console.error(
    '[Trivai] Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example → .env.local y configúralas en Vercel.',
  )
}

export const isSupabaseConfigured = !!(ENV.supabaseUrl && ENV.supabaseAnonKey)

export function getSupabaseEnv(): { url: string; key: string } | null {
  if (!isSupabaseConfigured) return null
  return { url: ENV.supabaseUrl, key: ENV.supabaseAnonKey }
}
