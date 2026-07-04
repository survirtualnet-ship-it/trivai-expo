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

export function requireSupabaseEnv(): { url: string; key: string } {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    throw new Error(
      'Supabase no configurado. Define EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  return { url: ENV.supabaseUrl, key: ENV.supabaseAnonKey }
}
