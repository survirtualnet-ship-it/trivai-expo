import { useQuery } from '@tanstack/react-query'
import {
  fetchUpcomingEvents,
  fetchEventById,
  fetchEventsMapMarkers,
  type EventsListFilters,
} from '@/lib/queries/events'
import { eventKeys, STALE } from '@/lib/queries/keys'
import type { EventCardData } from '@/components/ui/EventCard'

export interface UseEventsOptions extends EventsListFilters {
  enabled?: boolean
}

export function useEvents(options: UseEventsOptions = {}) {
  const { enabled = true, limit } = options

  return useQuery({
    queryKey: eventKeys.list({ limit }),
    queryFn: () => fetchUpcomingEvents({ limit }),
    enabled,
    staleTime: STALE.events,
    select: (data): EventCardData[] => data,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(id ?? ''),
    queryFn: () => fetchEventById(id!),
    enabled: !!id,
    staleTime: STALE.events,
  })
}

export function useEventsMapMarkers() {
  return useQuery({
    queryKey: eventKeys.map(),
    queryFn: fetchEventsMapMarkers,
    staleTime: STALE.events,
  })
}
