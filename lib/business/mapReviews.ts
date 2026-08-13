import type { PlaceReview } from '@/lib/queries/placeDetail'
import type { Review } from '@/src/company/types'

/** Map Supabase reviews → company panel model (single source: lib/reviews). */
export function placeReviewToCompanyReview(review: PlaceReview): Review {
  const userName =
    review.profile?.full_name?.trim() ||
    review.profile?.username?.trim() ||
    'Usuario'
  return {
    id: review.id,
    userName,
    rating: review.rating,
    comment: review.text ?? '',
    companyReply: review.response?.text,
    createdAt: review.created_at,
  }
}

export function placeReviewsToCompanyReviews(reviews: PlaceReview[]): Review[] {
  return reviews.map(placeReviewToCompanyReview)
}
