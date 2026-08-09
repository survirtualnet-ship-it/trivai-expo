import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import {
  fetchWeather,
  formatWeatherLine,
  type WeatherSnapshot,
} from '@/services/weatherService'
import type { Locale } from '@/src/data/mock'

/** Refresh weather every time Inicio mounts / app opens. */
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
    staleTime: 0,
    gcTime: 30 * 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
