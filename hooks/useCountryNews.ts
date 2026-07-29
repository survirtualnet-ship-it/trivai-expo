import { useQuery } from '@tanstack/react-query'
import { CACHE_KEYS, CACHE_TTL, readCache, writeCache } from '@/lib/homeCache'
import { QUERY_KEYS } from '@/lib/constants'
import { fetchCountryNews, type NewsItem } from '@/services/newsService'
import type { UserLocationProfile } from '@/services/locationService'
import type { Locale } from '@/src/data/mock'

async function loadNews(profile: UserLocationProfile): Promise<NewsItem[]> {
  const cacheKey = `${CACHE_KEYS.news}:${profile.countryCode}`
  try {
    const items = await fetchCountryNews(profile.countryCode, profile.country)
    if (items.length > 0) {
      await writeCache(cacheKey, items)
      return items
    }
  } catch {
    // fallback to cache
  }
  return (await readCache<NewsItem[]>(cacheKey)) ?? []
}

export function useCountryNews(
  profile: UserLocationProfile | undefined,
  locale: Locale,
  isLocationLoading: boolean,
) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.home.news, profile?.countryCode, profile?.country],
    queryFn: () => loadNews(profile!),
    enabled: !!profile?.country && !!profile?.countryCode,
    staleTime: CACHE_TTL.news,
  })

  const title =
    profile?.countryCode?.toUpperCase() === 'BO'
      ? locale === 'EN'
        ? 'Latest news · Opinión'
        : 'Últimas noticias · Opinión'
      : profile?.country != null
        ? locale === 'EN'
          ? `Latest news · ${profile.country}`
          : `Últimas noticias · ${profile.country}`
        : locale === 'EN'
          ? 'Latest news'
          : 'Últimas noticias'

  const subtitle =
    profile?.city && profile?.country
      ? locale === 'EN'
        ? `Based on your location: ${profile.city}`
        : `Según tu ubicación: ${profile.city}`
      : null

  return {
    items: query.data ?? [],
    title,
    subtitle,
    isLoading: isLocationLoading || query.isLoading,
    isEmpty: !query.isLoading && !query.isFetching && (query.data?.length ?? 0) === 0,
    isError: query.isError,
  }
}
