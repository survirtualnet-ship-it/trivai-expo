import type {
  EmergencyItem,
  HomeCategory,
  HomeContext,
  HomeFeed,
  HomePlace,
} from '@/lib/home/types'

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80`

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'gastronomia', emoji: '🍔', labelEs: 'Gastronomía', labelEn: 'Food', lugaresCat: 'Gastronomía' },
  { id: 'entretenimiento', emoji: '🎭', labelEs: 'Entretenimiento', labelEn: 'Fun', lugaresCat: 'Entretenimiento' },
  { id: 'turismo', emoji: '📍', labelEs: 'Turismo', labelEn: 'Tourism', lugaresCat: 'Parques' },
  { id: 'negocios', emoji: '🏢', labelEs: 'Negocios', labelEn: 'Business', lugaresCat: 'Otros' },
  { id: 'emergencia', emoji: '🚑', labelEs: 'Emergencia', labelEn: 'Emergency' },
  { id: 'otros', emoji: '🧩', labelEs: 'Otros', labelEn: 'Other', lugaresCat: 'Otros' },
]

export const HOME_EMERGENCIES: EmergencyItem[] = [
  {
    id: 'hospital',
    emoji: '🏥',
    labelEs: 'Hospital',
    labelEn: 'Hospital',
    subtitleEs: 'Urgencias 24h',
    subtitleEn: '24h emergency',
  },
  {
    id: 'farmacia',
    emoji: '💊',
    labelEs: 'Farmacia',
    labelEn: 'Pharmacy',
    subtitleEs: 'Abierta cerca',
    subtitleEn: 'Open nearby',
  },
  {
    id: 'policia',
    emoji: '👮',
    labelEs: 'Policía',
    labelEn: 'Police',
    subtitleEs: 'Asistencia local',
    subtitleEn: 'Local help',
  },
]

const PLACES: HomePlace[] = [
  {
    id: 'home-1',
    name: 'Mercado Lanza',
    rating: 4.6,
    distance: '200m',
    category: 'Gastronomía',
    imageUrl: img('photo-1555396273-367ea4eb4db5'),
    zone: 'nearby',
  },
  {
    id: 'home-2',
    name: 'Café del Teatro',
    rating: 4.8,
    distance: '350m',
    category: 'Gastronomía',
    imageUrl: img('photo-1501339847302-ac426a4a7cbb'),
    zone: 'nearby',
  },
  {
    id: 'home-3',
    name: 'Mirador Killi Killi',
    rating: 4.7,
    distance: '1.2km',
    category: 'Turismo',
    imageUrl: img('photo-1469854523086-cc02fe5d8800'),
    zone: 'nearby',
  },
  {
    id: 'home-4',
    name: 'Calle Jaén',
    rating: 4.9,
    distance: '800m',
    category: 'Turismo',
    imageUrl: img('photo-1523906834658-6e24ef2386f9'),
    zone: 'nearby',
  },
  {
    id: 'home-5',
    name: 'Sopocachi Bistro',
    rating: 4.5,
    distance: '2.1km',
    category: 'Gastronomía',
    imageUrl: img('photo-1517248135467-4c7edcad34c4'),
    zone: 'norte',
  },
  {
    id: 'home-6',
    name: 'Parque Urbano Central',
    rating: 4.4,
    distance: '1.8km',
    category: 'Turismo',
    imageUrl: img('photo-1441974231531-c6227db76b6e'),
    zone: 'norte',
  },
  {
    id: 'home-7',
    name: 'Mall Ventura',
    rating: 4.2,
    distance: '3.4km',
    category: 'Negocios',
    imageUrl: img('photo-1441986300917-64674bd600d8'),
    zone: 'sur',
  },
  {
    id: 'home-8',
    name: 'Zona Sur Food Hub',
    rating: 4.6,
    distance: '4.0km',
    category: 'Gastronomía',
    imageUrl: img('photo-1414235077428-338989a2e8c0'),
    zone: 'sur',
  },
  {
    id: 'home-9',
    name: 'Museo Nacional de Arte',
    rating: 4.7,
    distance: '1.5km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1578662996442-48f60103fc96'),
    zone: 'este',
  },
  {
    id: 'home-10',
    name: 'Teleférico Rojo',
    rating: 4.8,
    distance: '2.6km',
    category: 'Turismo',
    imageUrl: img('photo-1488646953014-85cb44e25828'),
    zone: 'oeste',
  },
  {
    id: 'home-11',
    name: 'Valle de la Luna',
    rating: 4.9,
    distance: '9km',
    category: 'Turismo',
    imageUrl: img('photo-1506905925346-21bda4d32df4'),
    zone: 'oeste',
  },
  {
    id: 'home-12',
    name: 'Witches Market Walk',
    rating: 4.5,
    distance: '600m',
    category: 'Turismo',
    imageUrl: img('photo-1539037116277-4db20889f2d4'),
    zone: 'nearby',
  },
  {
    id: 'home-13',
    name: 'Casa del Corregidor',
    rating: 4.6,
    distance: '900m',
    category: 'Entretenimiento',
    imageUrl: img('photo-1514933651103-005eec06c04b'),
    zone: 'nearby',
  },
]

export const DEFAULT_HOME_CONTEXT: HomeContext = {
  city: 'La Paz',
  weatherEmoji: '☀️',
  temperatureC: 18,
  usdToBob: 6.96,
  locale: 'ES',
}

function byZone(zone: HomePlace['zone']) {
  return PLACES.filter(p => p.zone === zone)
}

/** Mock feed — replace with TanStack Query + Supabase later. */
export function getHomeFeed(overrides?: Partial<HomeContext>): HomeFeed {
  const context: HomeContext = { ...DEFAULT_HOME_CONTEXT, ...overrides }
  return {
    context,
    categories: HOME_CATEGORIES,
    nearby: byZone('nearby'),
    norte: byZone('norte'),
    sur: byZone('sur'),
    este: byZone('este'),
    oeste: byZone('oeste'),
    emergencies: HOME_EMERGENCIES,
    recommended: [...byZone('nearby'), ...byZone('norte'), ...byZone('este')].slice(0, 6),
  }
}
