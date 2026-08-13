/** Google Place ID (ChIJ…) — canonical external key */
export type GooglePlaceId = string

/** Supabase places.id UUID — internal enrichment key */
export type PlaceUuid = string

export type CrowdLevel = 'low' | 'medium' | 'high'

/** Registry row: claim state for a Google place */
export type TrivaiBusiness = {
  place_id: PlaceUuid
  google_place_id: GooglePlaceId
  claimed: boolean
  owner_id: string | null
  claim_status?: 'unclaimed' | 'claimed' | 'identified'
  subscription_plan?: 'FREE' | 'PRO' | 'PREMIUM'
  subscription_status?: 'none' | 'free' | 'pro' | 'premium' | 'active' | 'expired' | 'cancelled'
  verification_status?: 'unverified' | 'pending' | 'verified'
  claimed_at?: string | null
  subscription_started_at?: string | null
  subscription_expires_at?: string | null
  custom_logo_url?: string | null
  created_at: string
  updated_at: string
}

/** Cached Google snapshot — not a owned business DB */
export type PlacesCacheRow = {
  google_place_id: GooglePlaceId
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  rating_avg: number | null
  rating_count: number | null
  photos: string[]
  last_fetched: string
}

/** Trivai-only dynamic enrichment */
export type PlaceLiveContent = {
  place_id: PlaceUuid
  best_time_tip: string | null
  crowd_level: CrowdLevel | null
  crowd_updated_at: string | null
  tips: PlaceTip[]
  updated_at: string
}

export type PlaceTip = {
  id: string
  text: string
  userId?: string
  createdAt: string
}

export type GooglePlaceSearchResult = {
  place_id: GooglePlaceId
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  total?: number
}

export type ClaimBusinessInput = {
  googlePlaceId: GooglePlaceId
  ownerId: string
  name: string
  address: string
  lat: number
  lng: number
  category?: string
  description?: string
  phone?: string
  website?: string
}

export type ClaimBusinessResult = {
  placeId: PlaceUuid
  googlePlaceId: GooglePlaceId
  claimed: boolean
  alreadyClaimed: boolean
}

export type HybridPlaceMeta = {
  googlePlaceId: GooglePlaceId | null
  claimed: boolean
  isOwner: boolean
  live: PlaceLiveContent | null
}
