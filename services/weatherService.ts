import {
  CACHE_KEYS,
  readCacheEntry,
  writeCache,
} from '@/lib/homeCache'

export type WeatherSnapshot = {
  temperatureC: number
  condition: string
  icon: string
  labelEs: string
  labelEn: string
}

const WMO: Record<number, { icon: string; es: string; en: string }> = {
  0: { icon: '☀️', es: 'Despejado', en: 'Clear' },
  1: { icon: '🌤️', es: 'Mayormente despejado', en: 'Mostly clear' },
  2: { icon: '⛅', es: 'Parcialmente nublado', en: 'Partly cloudy' },
  3: { icon: '☁️', es: 'Nublado', en: 'Cloudy' },
  45: { icon: '🌫️', es: 'Neblina', en: 'Fog' },
  48: { icon: '🌫️', es: 'Neblina', en: 'Fog' },
  51: { icon: '🌦️', es: 'Llovizna', en: 'Drizzle' },
  53: { icon: '🌦️', es: 'Llovizna', en: 'Drizzle' },
  55: { icon: '🌦️', es: 'Llovizna', en: 'Drizzle' },
  61: { icon: '🌧️', es: 'Lluvia', en: 'Rain' },
  63: { icon: '🌧️', es: 'Lluvia', en: 'Rain' },
  65: { icon: '🌧️', es: 'Lluvia fuerte', en: 'Heavy rain' },
  80: { icon: '🌧️', es: 'Chubascos', en: 'Showers' },
  95: { icon: '⛈️', es: 'Tormenta', en: 'Storm' },
}

function mapCode(code: number) {
  return WMO[code] ?? WMO[3]
}

/** Always hits the network; AsyncStorage is offline fallback only. */
export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherSnapshot> {
  const cached = await readCacheEntry<WeatherSnapshot>(CACHE_KEYS.weather)

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      '&current=temperature_2m,weather_code&timezone=auto'
    const res = await fetch(url)
    if (!res.ok) throw new Error('weather fetch failed')
    const json = await res.json() as {
      current?: { temperature_2m?: number; weather_code?: number }
    }
    const temp = Math.round(json.current?.temperature_2m ?? 22)
    const code = json.current?.weather_code ?? 3
    const mapped = mapCode(code)
    const snapshot: WeatherSnapshot = {
      temperatureC: temp,
      condition: mapped.es,
      icon: mapped.icon,
      labelEs: mapped.es,
      labelEn: mapped.en,
    }
    await writeCache(CACHE_KEYS.weather, snapshot)
    return snapshot
  } catch {
    if (cached) return cached.data
    return {
      temperatureC: 24,
      condition: 'Despejado',
      icon: '☀️',
      labelEs: 'Despejado',
      labelEn: 'Clear',
    }
  }
}

export function formatWeatherLine(
  weather: WeatherSnapshot,
  locale: 'ES' | 'EN',
): string {
  const label = locale === 'EN' ? weather.labelEn : weather.labelEs
  return `${weather.icon} ${weather.temperatureC}°C · ${label}`
}
