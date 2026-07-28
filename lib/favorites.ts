import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { logPlaceSave } from '@/lib/userActivity'
import { PLACE_CARD_SELECT } from '@/lib/queries/places'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

export async function isPlaceFavorite(userId: string, placeId: string): Promise<boolean> {
  const { data } = await supabase.from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('place_id', placeId)
    .maybeSingle()
  return !!data
}

export async function isEventSaved(userId: string, eventId: string): Promise<boolean> {
  const { data } = await supabase.from('event_attendees')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .eq('status', 'interested')
    .maybeSingle()
  return !!data
}

export async function togglePlaceFavorite(userId: string, placeId: string, active: boolean): Promise<void> {
  if (active) {
    await supabase.from('favorites').upsert({ user_id: userId, place_id: placeId })
    logPlaceSave(userId, placeId)
  } else {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('place_id', placeId)
  }
}

export async function toggleEventSaved(userId: string, eventId: string, active: boolean): Promise<void> {
  if (active) {
    await supabase.from('event_attendees').upsert({
      event_id: eventId,
      user_id: userId,
      status: 'interested',
    })
  } else {
    await supabase.from('event_attendees')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('status', 'interested')
  }
}

export async function loadSavedEventIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase.from('event_attendees')
    .select('event_id')
    .eq('user_id', userId)
    .eq('status', 'interested')
  return new Set((data ?? []).map(r => r.event_id))
}

export async function fetchFavoritePlaces(userId: string): Promise<PlaceCardData[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`created_at, place:places(${PLACE_CARD_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? [])
    .map(row => (row as { place?: PlaceCardData | null }).place)
    .filter((p): p is PlaceCardData => !!p?.id)
}

export async function withAuth<T>(fn: (userId: string) => Promise<T>): Promise<T | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    router.push('/auth')
    return null
  }
  return fn(session.user.id)
}
