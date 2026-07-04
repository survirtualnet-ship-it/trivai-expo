/** Variables EXPO_PUBLIC_* — embebidas en build (Vercel / EAS) */

function readEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(
      `[Trivai] Falta ${name}. Copia .env.example → .env.local y configura las variables en Vercel.`,
    )
    return ''
  }
  return value
}

export const ENV = {
  supabaseUrl:     readEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  googleMapsKey:   process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim() ?? '',
  appUrl:          (process.env.EXPO_PUBLIC_APP_URL?.trim() || 'https://trivai-expo.vercel.app').replace(/\/$/, ''),
  webApiUrl:       (process.env.EXPO_PUBLIC_WEB_API_URL?.trim() || 'https://trivai.vercel.app').replace(/\/$/, ''),
} as const

export const isSupabaseConfigured = !!(ENV.supabaseUrl && ENV.supabaseAnonKey)

export function getSupabaseEnv(): { url: string; key: string } | null {
  if (!isSupabaseConfigured) return null
  return { url: ENV.supabaseUrl, key: ENV.supabaseAnonKey }
}
