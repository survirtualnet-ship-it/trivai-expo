/** Home screen domain types — ready for Supabase swap. */

export type HomeLocale = 'ES' | 'EN'

export type HomeZone = 'nearby' | 'norte' | 'sur' | 'este' | 'oeste'

export type HomeCategoryId =
  | 'gastronomia'
  | 'entretenimiento'
  | 'turismo'
  | 'negocios'
  | 'emergencia'
  | 'otros'

export type HomePlace = {
  id: string
  name: string
  rating: number
  distance: string
  category: string
  imageUrl: string
  zone: HomeZone
}

export type HomeCategory = {
  id: HomeCategoryId
  emoji: string
  labelEs: string
  labelEn: string
  /** Route param for /lugares when available */
  lugaresCat?: string
}

export type EmergencyKind = 'hospital' | 'farmacia' | 'policia'

export type EmergencyItem = {
  id: EmergencyKind
  emoji: string
  labelEs: string
  labelEn: string
  subtitleEs: string
  subtitleEn: string
}

export type HomeContext = {
  city: string
  weatherEmoji: string
  temperatureC: number
  usdToBob: number
  locale: HomeLocale
}

export type HomeFeed = {
  context: HomeContext
  categories: HomeCategory[]
  nearby: HomePlace[]
  norte: HomePlace[]
  sur: HomePlace[]
  este: HomePlace[]
  oeste: HomePlace[]
  emergencies: EmergencyItem[]
  recommended: HomePlace[]
}
