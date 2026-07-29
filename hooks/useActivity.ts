import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { fetchActivityFeed } from '@/services/activity.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useActivity() {
  const { user, isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: [...QUERY_KEYS.activity, user?.id ?? 'anon'],
    queryFn: () => fetchActivityFeed(user?.id ?? null),
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  return {
    items: query.data ?? [],
    isLoading: isAuthenticated && query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isAuthenticated,
  }
}
