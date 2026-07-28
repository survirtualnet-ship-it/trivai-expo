import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { recommendationKeys, STALE } from '@/lib/queries/keys'
import { fetchUserRecommendationProfile } from '@/services/fetchUserRecommendationProfile'
import {
  getRecommendedPlaces,
  getRecommendedPlaceList,
  type GetRecommendedPlacesOptions,
  type UserProfile,
} from '@/services/recommendation'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { Coords } from '@/lib/geolocation'

/** Loads the behavioral UserProfile for the signed-in user (or cold-start). */
export function useRecommendationProfile() {
  const { user } = useUser()
  const userId = user?.id ?? null

  return useQuery({
    queryKey: recommendationKeys.profile(userId),
    queryFn: () => fetchUserRecommendationProfile(userId),
    staleTime: STALE.user,
  })
}

/**
 * Rank an in-memory candidate list with the recommendation engine.
 * Pass candidates from Discover pool / mock API / explorer.
 */
export function useRecommendedPlaces(
  candidates: PlaceCardData[] | undefined,
  options: Omit<GetRecommendedPlacesOptions, 'scorer'> & { enabled?: boolean } = {},
) {
  const profileQuery = useRecommendationProfile()
  const { limit = 20, coords = null, excludeSeen = true, enabled = true } = options

  const ranked = useQuery({
    queryKey: [
      ...recommendationKeys.places(profileQuery.data ? 'ready' : 'pending', limit),
      candidates?.length ?? 0,
      coords?.lat ?? null,
      coords?.lng ?? null,
    ],
    queryFn: () => {
      const profile = profileQuery.data as UserProfile
      return getRecommendedPlaces(profile, candidates ?? [], {
        limit,
        coords,
        excludeSeen,
      })
    },
    enabled: enabled && !!profileQuery.data && (candidates?.length ?? 0) > 0,
    staleTime: STALE.places,
  })

  return {
    profile: profileQuery.data ?? null,
    profileLoading: profileQuery.isLoading,
    recommendations: ranked.data ?? [],
    places: (ranked.data ?? []).map(s => s.place),
    isLoading: profileQuery.isLoading || ranked.isLoading,
    isError: profileQuery.isError || ranked.isError,
    refetch: async () => {
      await profileQuery.refetch()
      await ranked.refetch()
    },
  }
}

/** Sync helper when profile is already loaded. */
export function rankPlacesForProfile(
  profile: UserProfile,
  candidates: PlaceCardData[],
  options?: GetRecommendedPlacesOptions,
): PlaceCardData[] {
  return getRecommendedPlaceList(profile, candidates, options)
}

export type { UserProfile, Coords }
