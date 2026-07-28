import { useFavoritePlaces } from '@/hooks/useFavoritePlaces'

/** Profile stats derived from the favorites list query (single cache, no key collision). */
export function useProfileStats() {
  const { isAuthenticated, total, isLoading } = useFavoritePlaces()

  return {
    savedPlaces: total,
    /** Placeholder until visit tracking ships */
    visits: 0,
    isLoading: isAuthenticated && isLoading,
  }
}
