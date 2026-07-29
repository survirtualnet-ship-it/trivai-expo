import type { Locale } from '@/src/data/mock'
import type { UserLocationProfile } from '@/services/locationService'

const CATEGORY_QUERY: Record<string, { es: string; en: string }> = {
  gastro: { es: 'Restaurantes cerca', en: 'Restaurants nearby' },
  fun: { es: 'Entretenimiento cerca', en: 'Entertainment nearby' },
  tourism: { es: 'Lugares turísticos', en: 'Tourist spots' },
  biz: { es: 'Negocios cerca', en: 'Business nearby' },
  emergency: { es: 'Emergencia cerca', en: 'Emergency nearby' },
  other: { es: 'Explorar cerca', en: 'Explore nearby' },
}

export function buildHomeSearchParams(
  profile: UserLocationProfile,
  locale: Locale,
  categoryId?: string,
): Record<string, string> {
  const city = profile.city
  const district = profile.district
  const base =
    categoryId && CATEGORY_QUERY[categoryId]
      ? locale === 'EN'
        ? CATEGORY_QUERY[categoryId].en
        : CATEGORY_QUERY[categoryId].es
      : suggestSearchQuery(city, district, locale)

  return {
    q: base,
    city,
    lat: String(profile.latitude),
    lng: String(profile.longitude),
    country: profile.countryCode,
  }
}

export function suggestSearchQuery(
  city: string,
  district: string | null | undefined,
  locale: Locale,
): string {
  const key = city.toLowerCase()
  const zone = district ?? city

  if (key.includes('lima')) {
    return locale === 'EN'
      ? `What to visit in ${zone}`
      : `Qué visitar en ${zone}`
  }
  if (key.includes('santa cruz')) {
    return locale === 'EN' ? 'Typical food nearby' : 'Comida típica cerca'
  }
  return locale === 'EN'
    ? `Events in ${city} today`
    : `Eventos hoy en ${city}`
}
