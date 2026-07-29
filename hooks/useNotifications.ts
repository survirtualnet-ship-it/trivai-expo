import { useMemo } from 'react'
import { fetchLocationAlerts, primaryAlert } from '@/services/notificationsService'
import type { UserLocationProfile } from '@/services/locationService'
import type { WeatherSnapshot } from '@/services/weatherService'
import type { Locale } from '@/src/data/mock'

export function useNotifications(
  profile: UserLocationProfile | undefined,
  weather: WeatherSnapshot | undefined,
  nearbyCount: number,
  locale: Locale,
) {
  const alerts = useMemo(() => {
    if (!profile || !weather) return []
    return fetchLocationAlerts({
      profile,
      weather,
      nearbyCount,
      locale,
    })
  }, [profile, weather, nearbyCount, locale])

  const alertLine = primaryAlert(alerts, locale)
  const hasAlert = alerts.some(a => a.severity === 'warning')

  return { alerts, alertLine, hasAlert }
}
