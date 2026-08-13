import { supabase } from '@/lib/supabase'
import type { PlaceLiveContent, TrivaiBusiness } from './types'

export async function fetchBusinessByPlaceId(
  placeId: string,
): Promise<TrivaiBusiness | null> {
  const { data, error } = await supabase
    .from('trivai_business')
    .select('*')
    .eq('place_id', placeId)
    .maybeSingle()

  if (error) {
    console.warn('[trivai_business]', error.message)
    return null
  }
  return data as TrivaiBusiness | null
}

export async function fetchBusinessByGooglePlaceId(
  googlePlaceId: string,
): Promise<TrivaiBusiness | null> {
  const { data, error } = await supabase
    .from('trivai_business')
    .select('*')
    .eq('google_place_id', googlePlaceId)
    .maybeSingle()

  if (error) {
    console.warn('[trivai_business]', error.message)
    return null
  }
  return data as TrivaiBusiness | null
}

export async function fetchPlaceLiveContent(
  placeId: string,
): Promise<PlaceLiveContent | null> {
  const { data, error } = await supabase
    .from('place_live_content')
    .select('*')
    .eq('place_id', placeId)
    .maybeSingle()

  if (error) {
    console.warn('[place_live_content]', error.message)
    return null
  }
  if (!data) return null

  return {
    ...data,
    tips: Array.isArray(data.tips) ? data.tips : [],
  } as PlaceLiveContent
}

export async function fetchBusinessesByOwnerId(
  ownerId: string,
): Promise<TrivaiBusiness[]> {
  const { data, error } = await supabase
    .from('trivai_business')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('claimed', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.warn('[trivai_business] list by owner', error.message)
    return []
  }
  return (data ?? []) as TrivaiBusiness[]
}

export async function findPlaceUuidByGoogleId(
  googlePlaceId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('places')
    .select('id')
    .eq('google_place_id', googlePlaceId)
    .maybeSingle()
  return data?.id ?? null
}
