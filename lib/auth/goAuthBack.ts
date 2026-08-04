import { router, type Href } from 'expo-router'

/** Back navigation for auth screens — falls back when history is empty (e.g. after router.replace). */
export function goAuthBack(fallbackHref: Href = '/welcome') {
  if (router.canGoBack()) {
    router.back()
    return
  }
  router.replace(fallbackHref)
}
