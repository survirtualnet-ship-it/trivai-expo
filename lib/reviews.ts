import { supabase } from '@/lib/supabase'
import { grantXP, XP } from '@/lib/xp'
import type { PlaceReview } from '@/lib/queries/placeDetail'

export type ReviewResponse = {
  id: string
  text: string
  created_at: string
  business_id: string
}

export type PlaceLifeBadge = {
  id: 'nuevo' | 'negocio_activo' | 'responde_rapido'
  label: string
}

function mapReviewRow(row: any): PlaceReview {
  const responseRaw = row.response ?? row.review_responses
  const responseRow = Array.isArray(responseRaw) ? responseRaw[0] : responseRaw
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    rating: row.rating,
    text: row.text ?? null,
    created_at: row.created_at,
    profile: row.profile ?? null,
    response: responseRow
      ? {
          id: responseRow.id,
          text: responseRow.text,
          created_at: responseRow.created_at,
          business_id: responseRow.business_id,
        }
      : null,
  }
}

/** Fetch reviews newest-first, including business replies when available. */
export async function fetchPlaceReviewsWithReplies(
  placeId: string,
  limit = 30,
): Promise<PlaceReview[]> {
  const withReplies = await supabase
    .from('reviews')
    .select(
      `
      id, user_id, rating, text, created_at,
      profile:profiles(full_name, username),
      response:review_responses(id, text, created_at, business_id)
    `,
    )
    .eq('place_id', placeId)
    .or('is_hidden.is.null,is_hidden.eq.false')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!withReplies.error) {
    return (withReplies.data ?? []).map(mapReviewRow)
  }

  // Fallback: table/join not migrated yet
  const basic = await supabase
    .from('reviews')
    .select('id, user_id, rating, text, created_at, profile:profiles(full_name, username)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (basic.error) throw basic.error
  return (basic.data ?? []).map(mapReviewRow)
}

export async function createPlaceReview(input: {
  placeId: string
  userId: string
  rating: number
  text: string
  authorName?: string | null
}): Promise<{ ok: true; review: PlaceReview } | { ok: false; error: string }> {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)))
  const text = input.text.trim()
  if (!text) return { ok: false, error: 'Escribe un poco sobre tu experiencia' }
  if (text.length < 8) {
    return { ok: false, error: 'Cuéntanos un poco más (mín. 8 caracteres)' }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      place_id: input.placeId,
      user_id: input.userId,
      rating,
      text,
    })
    .select('id, user_id, rating, text, created_at')
    .single()

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? 'No se pudo publicar la reseña',
    }
  }

  // Best-effort aggregate refresh (trigger may already do this)
  void supabase.rpc('refresh_place_rating', { p_place_id: input.placeId })
  void grantXP(input.userId, XP.review)

  const review: PlaceReview = {
    id: data.id,
    user_id: data.user_id,
    rating: data.rating,
    text: data.text,
    created_at: data.created_at,
    profile: {
      full_name: input.authorName ?? 'Tú',
      username: null,
    },
    response: null,
  }

  return { ok: true, review }
}

export async function createReviewResponse(input: {
  reviewId: string
  businessId: string
  ownerId: string
  text: string
}): Promise<{ ok: true; response: ReviewResponse } | { ok: false; error: string }> {
  const text = input.text.trim()
  if (!text) return { ok: false, error: 'Escribe una respuesta' }

  const { data, error } = await supabase
    .from('review_responses')
    .upsert(
      {
        review_id: input.reviewId,
        business_id: input.businessId,
        owner_id: input.ownerId,
        text,
      },
      { onConflict: 'review_id' },
    )
    .select('id, text, created_at, business_id')
    .single()

  if (error || !data) {
    return {
      ok: false,
      error:
        error?.message?.includes('review_responses')
          ? 'Falta migrar review_responses en Supabase'
          : error?.message ?? 'No se pudo publicar la respuesta',
    }
  }

  return {
    ok: true,
    response: {
      id: data.id,
      text: data.text,
      created_at: data.created_at,
      business_id: data.business_id,
    },
  }
}

export function unansweredReviewCount(reviews: PlaceReview[]): number {
  return reviews.filter(r => !r.response).length
}

/** Life signals derived only from enrichment (reviews / replies / claim). */
export function computePlaceLifeBadges(input: {
  claimed: boolean
  reviews: PlaceReview[]
  placeCreatedAt?: string | null
}): PlaceLifeBadge[] {
  const badges: PlaceLifeBadge[] = []
  const now = Date.now()
  const reviews = input.reviews

  const newestReview = reviews[0]
  if (newestReview) {
    const ageMs = now - new Date(newestReview.created_at).getTime()
    if (ageMs < 1000 * 60 * 60 * 48) {
      badges.push({ id: 'nuevo', label: 'Nuevo' })
    }
  } else if (input.placeCreatedAt) {
    const ageMs = now - new Date(input.placeCreatedAt).getTime()
    if (ageMs < 1000 * 60 * 60 * 24 * 7) {
      badges.push({ id: 'nuevo', label: 'Nuevo' })
    }
  }

  const replies = reviews.filter(r => r.response)
  if (input.claimed && replies.length > 0) {
    badges.push({ id: 'negocio_activo', label: 'Negocio activo' })
  }

  const fast = replies.some(r => {
    if (!r.response) return false
    const reviewAt = new Date(r.created_at).getTime()
    const replyAt = new Date(r.response.created_at).getTime()
    return replyAt - reviewAt < 1000 * 60 * 60 * 48
  })
  if (fast) {
    badges.push({ id: 'responde_rapido', label: 'Responde rápido' })
  }

  return badges.slice(0, 3)
}
