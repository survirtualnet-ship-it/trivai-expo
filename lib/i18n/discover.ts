export type AppLocale = 'es' | 'en'

export const DISCOVER_STRINGS = {
  es: {
    searchPlaceholder: 'Buscar eventos, lugares, amigos...',
    filterHoy: 'Hoy',
    filterCerca: 'Cerca',
    filterDestacados: 'Destacados',
    seeAll: 'Ver todos',
    open: 'Abierto',
    closed: 'Cerrado',
    min: 'min',
    zone: 'Zona',
    noResults: 'Sin resultados para este filtro',
    seeAllLink: 'Ver todo',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    help: 'Ayuda',
    cancel: 'Cancelar',
    language: 'Idioma',
    languageEs: 'Español',
    languageEn: 'English',
    signOutConfirm: '¿Estás seguro?',
    userMenu: 'Cuenta',
    eventsInCategory: 'Eventos',
  },
  en: {
    searchPlaceholder: 'Search events, places, friends...',
    filterHoy: 'Today',
    filterCerca: 'Nearby',
    filterDestacados: 'Featured',
    seeAll: 'See all',
    open: 'Open',
    closed: 'Closed',
    min: 'min',
    zone: 'Zone',
    noResults: 'No results for this filter',
    seeAllLink: 'See all',
    signIn: 'Sign in',
    signOut: 'Sign out',
    help: 'Help',
    cancel: 'Cancel',
    language: 'Language',
    languageEs: 'Español',
    languageEn: 'English',
    signOutConfirm: 'Are you sure?',
    userMenu: 'Account',
    eventsInCategory: 'Events',
  },
} as const

export type DiscoverStrings = (typeof DISCOVER_STRINGS)[AppLocale]

export function formatToday(locale: AppLocale): string {
  const raw = new Date().toLocaleDateString(locale === 'es' ? 'es-BO' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function categoryLabel(cat: string, locale: AppLocale): string {
  const es: Record<string, string> = {
    Gastronomía: 'Gastronomía',
    Entretenimiento: 'Entretenimiento',
    Parques: 'Parques',
    Otros: 'Otros',
  }
  const en: Record<string, string> = {
    Gastronomía: 'Dining',
    Entretenimiento: 'Entertainment',
    Parques: 'Parks',
    Otros: 'Other',
  }
  return (locale === 'es' ? es : en)[cat] ?? cat
}
