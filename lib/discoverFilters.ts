import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import type { Category } from '@/lib/categories'
import { normalizeCategory } from '@/lib/tokens'
import { getCityZone, type CityZone } from '@/lib/zones'
import { esHoy, haversineKm } from '@/lib/eventUtils'

export type LocationFilter = 'hoy' | 'cerca' | CityZone
export type CategoryFilter = Category | 'Todos'

export type EnrichedPlace = PlaceCardData & { _dist?: number; _zone?: CityZone | null }
export type EnrichedEvent = EventCardData & { _dist?: number; _zone?: CityZone | null }

export function enrichAllPlaces(
  places: PlaceCardData[],
  origin: { lat: number; lng: number },
): EnrichedPlace[] {
  return enrichPlacesWithZone(
    places.map(p => {
      if (p.latitude != null && p.longitude != null) {
        return {
          ...p,
          _dist: haversineKm(origin.lat, origin.lng, p.latitude, p.longitude),
        }
      }
      return p
    }),
  )
}

export function enrichAllEvents(
  events: EventCardData[],
  origin: { lat: number; lng: number },
): EnrichedEvent[] {
  return enrichEventsWithZone(
    events.map(ev => {
      const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude != null && pl?.longitude != null) {
        return {
          ...ev,
          _dist: haversineKm(origin.lat, origin.lng, pl.latitude, pl.longitude),
        }
      }
      return ev
    }),
  )
}

export function enrichPlacesWithZone(places: PlaceCardData[]): EnrichedPlace[] {
  return places.map(p => ({
    ...p,
    _zone:
      p.latitude != null && p.longitude != null
        ? getCityZone(p.latitude, p.longitude)
        : null,
  }))
}

export function enrichEventsWithZone(events: EventCardData[]): EnrichedEvent[] {
  return events.map(ev => {
    const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
    return {
      ...ev,
      _zone:
        pl?.latitude != null && pl?.longitude != null
          ? getCityZone(pl.latitude, pl.longitude)
          : null,
    }
  })
}

export function applyDiscoverFilters(
  places: EnrichedPlace[],
  events: EnrichedEvent[],
  categoryFilter: CategoryFilter,
  locationFilter: LocationFilter | null,
  hasUserCoords: boolean,
): { filteredPlaces: EnrichedPlace[]; filteredEvents: EnrichedEvent[] } {
  let filteredPlaces = places
  let filteredEvents = events

  if (categoryFilter !== 'Todos') {
    filteredPlaces = filteredPlaces.filter(p => normalizeCategory(p.category) === categoryFilter)
    filteredEvents = filteredEvents.filter(e => normalizeCategory(e.category) === categoryFilter)
  }

  if (locationFilter === 'hoy') {
    filteredEvents = filteredEvents.filter(e => esHoy(e.start_datetime))
    if (categoryFilter === 'Entretenimiento') {
      filteredPlaces = []
    }
  } else if (locationFilter === 'cerca' && hasUserCoords) {
    filteredPlaces = filteredPlaces
      .filter(p => p._dist != null)
      .sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    filteredEvents = filteredEvents
      .filter(e => e._dist != null)
      .sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
  } else if (locationFilter != null && locationFilter !== 'hoy' && locationFilter !== 'cerca') {
    filteredPlaces = filteredPlaces.filter(p => p._zone === locationFilter)
    filteredEvents = filteredEvents.filter(e => e._zone === locationFilter)
  }

  return { filteredPlaces, filteredEvents }
}
