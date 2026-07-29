import type { UserLocationProfile } from '@/services/locationService'
import type { WeatherSnapshot } from '@/services/weatherService'

export type HomeAlert = {
  id: string
  messageEs: string
  messageEn: string
  severity: 'info' | 'warning' | 'promo'
}

type Input = {
  profile: UserLocationProfile
  weather: WeatherSnapshot
  nearbyCount: number
  locale: 'ES' | 'EN'
}

const CITY_ALERTS: Record<string, { es: string[]; en: string[] }> = {
  lima: {
    es: [
      '⚠️ Tráfico elevado en Miraflores',
      '🎉 Festival gastronómico cerca',
      '🍽️ Restaurantes populares cerca',
    ],
    en: [
      '⚠️ Heavy traffic in Miraflores',
      '🎉 Food festival nearby',
      '🍽️ Popular restaurants nearby',
    ],
  },
  'santa cruz': {
    es: [
      '🔥 Evento cultural cercano',
      '🍽️ Restaurantes populares cerca',
      '🌳 Parques recomendados hoy',
    ],
    en: [
      '🔥 Cultural event nearby',
      '🍽️ Popular restaurants nearby',
      '🌳 Recommended parks today',
    ],
  },
}

function cityKey(city: string) {
  return city.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function fetchLocationAlerts(input: Input): HomeAlert[] {
  const { profile, weather, nearbyCount } = input
  const key = cityKey(profile.city)
  const bucket =
    Object.entries(CITY_ALERTS).find(([k]) => key.includes(k))?.[1]
    ?? CITY_ALERTS['santa cruz']

  const alerts: HomeAlert[] = bucket.es.map((es, i) => ({
    id: `local-${i}`,
    messageEs: es,
    messageEn: bucket.en[i] ?? es,
    severity: es.includes('⚠️') ? 'warning' : 'promo',
  }))

  if (weather.condition.toLowerCase().includes('lluv') || weather.icon.includes('🌧')) {
    alerts.unshift({
      id: 'weather-rain',
      messageEs: '🌦️ Cambio climático próximo — lleva paraguas',
      messageEn: '🌦️ Weather shift ahead — bring an umbrella',
      severity: 'warning',
    })
  }

  if (nearbyCount === 0) {
    alerts.push({
      id: 'empty-nearby',
      messageEs: '📍 Explorando opciones en tu zona',
      messageEn: '📍 Exploring options in your area',
      severity: 'info',
    })
  }

  return alerts.slice(0, 3)
}

export function primaryAlert(alerts: HomeAlert[], locale: 'ES' | 'EN'): string {
  if (alerts.length === 0) {
    return locale === 'EN' ? '🛑 No active alerts' : '🛑 Sin alertas activas'
  }
  const first = alerts[0]
  return locale === 'EN' ? first.messageEn : first.messageEs
}
