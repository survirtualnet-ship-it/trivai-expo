import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { normalizeCategory } from '@/lib/categories'
import type { DiscoverPreferences } from '@/lib/discoverPreferences'
import { hasActiveDiscoverPreferences } from '@/lib/discoverPreferences'
import type { ActivityCategoryProfile } from '@/lib/userActivity'
import type { Coords } from '@/lib/geolocation'
import { enrichAllPlaces } from '@/lib/discoverFilters'

export function buildExplorerRecommendation(
  place: PlaceCardData,
  prefs: DiscoverPreferences | null,
  activityProfile: ActivityCategoryProfile | null,
  origin: Coords,
): string {
  const cat = normalizeCategory(place.category)
  const enriched = enrichAllPlaces([place], origin)[0]
  const dist = enriched._dist

  if (place.is_featured) {
    return 'Selección destacada del equipo Trivai en esta zona'
  }

  if (prefs?.categories.includes(cat)) {
    return `Coincide con tu interés en ${cat.toLowerCase()}`
  }

  const affinity = activityProfile?.weights.get(cat)
  if (affinity != null && affinity >= 0.6) {
    return `Popular entre viajeros que disfrutan ${cat.toLowerCase()}`
  }

  if ((place.rating_avg ?? 0) >= 4.5 && (place.rating_count ?? 0) >= 8) {
    return 'Muy valorado por la comunidad local'
  }

  if (dist != null && dist <= 1.2) {
    return 'A pocos minutos de donde estás'
  }

  if (dist != null && dist <= 3) {
    return 'Cerca de tu zona actual — ideal para una parada rápida'
  }

  if (hasActiveDiscoverPreferences(prefs) && prefs?.location?.city) {
    return `Buena opción para explorar ${prefs.location.city}`
  }

  return 'Recomendado para descubrir cerca de ti'
}
