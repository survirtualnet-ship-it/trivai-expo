import { Platform, Share } from 'react-native'
import { appLink } from '@/lib/appUrl'
import { logPlaceShare } from '@/lib/userActivity'
import { getCatLabel } from '@/lib/tokens'

export interface SharePlaceInput {
  id: string
  name: string
  description?: string | null
  category?: string
  photos?: string[] | null
  address?: string | null
}

const DESCRIPTION_MAX = 140

/** Public deep link to a place detail screen. */
export function placeDeepLink(placeId: string): string {
  return appLink(`/lugares/${placeId}`)
}

function buildShareDescription(place: SharePlaceInput): string {
  const trimmed = place.description?.trim()
  if (trimmed) {
    return trimmed.length > DESCRIPTION_MAX
      ? `${trimmed.slice(0, DESCRIPTION_MAX - 1)}…`
      : trimmed
  }

  const cat = place.category ? getCatLabel(place.category) : 'lugar'
  const where = place.address?.trim()
  if (where) return `${cat} en ${where}`
  return `Descubre este ${cat.toLowerCase()} en Santa Cruz con Trivai`
}

/** Native / web share sheet — fire-and-forget, never throws on user cancel. */
export async function sharePlace(
  place: SharePlaceInput,
  userId?: string | null,
): Promise<void> {
  const url = placeDeepLink(place.id)
  const description = buildShareDescription(place)
  const photoUrl = place.photos?.[0]?.trim() || null

  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: place.name,
        text: photoUrl ? `${description}\n\n${photoUrl}` : description,
        url,
      })
    } else if (Platform.OS === 'ios') {
      const message = photoUrl
        ? `${description}\n\n${photoUrl}\n\n${url}`
        : `${description}\n\n${url}`
      await Share.share({ title: place.name, message, url })
    } else {
      const message = photoUrl
        ? `${place.name}\n\n${description}\n\n${photoUrl}\n\n${url}`
        : `${place.name}\n\n${description}\n\n${url}`
      await Share.share({ title: place.name, message })
    }
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? ''
    if (msg.toLowerCase().includes('abort') || msg.toLowerCase().includes('cancel')) return
    if (__DEV__) console.warn('[sharePlace]', msg)
  } finally {
    if (userId) logPlaceShare(userId, place.id)
  }
}
