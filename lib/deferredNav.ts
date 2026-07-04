import { router, type Href } from 'expo-router'

/** Navegación diferida para no bloquear el siguiente frame (INP en web). */
export function deferredPush(href: Href) {
  requestAnimationFrame(() => router.push(href))
}

export function deferredReplace(href: Href) {
  requestAnimationFrame(() => router.replace(href))
}
