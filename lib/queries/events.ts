import { supabase, type Event } from '@/lib/supabase'
import type { EventCardData } from '@/components/ui/EventCard'

export const EVENT_CARD_SELECT =
  'id,name,category,start_datetime,is_free,price,attendees_count,photos,place:places(name,address,latitude,longitude)'

export const EVENT_MAP_SELECT =
  'id,name,category,start_datetime,place:places(latitude,longitude)'

export interface EventsListFilters {
  limit?: number
}

export interface EventMapMarker {
  id: string
  name: string
  category: string
  lat: number
  lng: number
}

export async function fetchUpcomingEvents(filters: EventsListFilters = {}): Promise<EventCardData[]> {
  const { limit = 200 } = filters

  const { data, error } = await supabase
    .from('events')
    .select(EVENT_CARD_SELECT)
    .eq('is_active', true)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as EventCardData[]).map(e => ({
    ...e,
    attendees_count: e.attendees_count ?? 0,
  }))
}

export async function fetchEventById(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Event
}

export async function fetchEventsMapMarkers(): Promise<EventMapMarker[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_MAP_SELECT)
    .eq('is_active', true)
    .gte('start_datetime', new Date().toISOString())

  if (error) throw error
  return (data ?? [])
    .filter((e: any) => e.place?.latitude && e.place?.longitude)
    .map((e: any) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      lat: e.place.latitude,
      lng: e.place.longitude,
    }))
}
