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
  const params: Record<string, string> = {
    city: profile.city,
    lat: String(profile.latitude),
    lng: String(profile.longitude),
    country: profile.countryCode,
  }

  if (categoryId && CATEGORY_QUERY[categoryId]) {
    params.q =
      locale === 'EN'
        ? CATEGORY_QUERY[categoryId].en
        : CATEGORY_QUERY[categoryId].es
  }

  return params
}
