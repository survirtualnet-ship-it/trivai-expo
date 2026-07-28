/** Popular search terms — shown when input is empty */
export const POPULAR_SEARCHES = [
  'Restaurantes cerca',
  'Cafés',
  'Hoteles',
  'Gastronomía',
  'Vida nocturna',
  'Parques',
  'Equipetrol',
  'Brunch',
] as const

export type PopularSearch = (typeof POPULAR_SEARCHES)[number]
