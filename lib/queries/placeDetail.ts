import { supabase } from '@/lib/supabase'
import { PLACE_CARD_SELECT, fetchPlacesList } from '@/lib/queries/places'
import { dedupePlaces } from '@/lib/places'
import { fetchPlaceReviewsWithReplies } from '@/lib/reviews'

export interface PlaceReview {
  id: string
  user_id?: string | null
  rating: number
  text: string | null
  created_at: string
  profile: {
    full_name: string | null
    username: string | null
  } | null
  response?: {
    id: string
    text: string
    created_at: string
    business_id: string
  } | null
}

export async function fetchPlaceReviews(
  placeId: string,
  limit = 20,
): Promise<PlaceReview[]> {
  return fetchPlaceReviewsWithReplies(placeId, limit)
}

export async function fetchSimilarPlaces(
  placeId: string,
  category: string,
  limit = 12,
): Promise<ReturnType<typeof fetchPlacesList>> {
  const { data, error } = await supabase
    .from('places')
    .select(PLACE_CARD_SELECT)
    .eq('category', category)
    .neq('id', placeId)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('rating_avg', { ascending: false })
    .limit(limit)

  if (error) throw error
  return dedupePlaces((data ?? []) as Awaited<ReturnType<typeof fetchPlacesList>>)
}
