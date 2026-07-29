import { useQuery } from '@tanstack/react-query'
import { CACHE_TTL, QUERY_KEYS } from '@/lib/constants'
import {
  fetchWeather,
  formatWeatherLine,
  type WeatherSnapshot,
} from '@/services/weatherService'
import type { Locale } from '@/src/data/mock'

export function useWeather(
  latitude: number | undefined,
  longitude: number | undefined,
  locale: Locale,
  isLocationLoading: boolean,
) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.home.weather, latitude, longitude],
    queryFn: () => fetchWeather(latitude!, longitude!),
    enabled: latitude != null && longitude != null,
    staleTime: CACHE_TTL.weather,
  })

  const weather = query.data
  const isLoading = isLocationLoading || (query.isLoading && !weather)

  const line = isLoading
    ? locale === 'EN'
      ? 'Detecting your location...'
      : 'Detectando tu ubicación...'
    : weather
      ? formatWeatherLine(weather, locale)
      : locale === 'EN'
        ? '☀️ — · —'
        : '☀️ — · —'

  return {
    weather: weather as WeatherSnapshot | undefined,
    weatherLine: line,
    isLoading,
    isFromCache: query.isError && !!weather,
  }
}
