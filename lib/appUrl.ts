import { ENV } from '@/lib/env'

/** URL pública de la app (PWA / share links) */
export const APP_URL = ENV.appUrl

export function appLink(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${APP_URL}${p}`
}
