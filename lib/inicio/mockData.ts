export type InicioLocale = 'ES' | 'EN'

export type InicioCategoryId =
  | 'gastronomia'
  | 'entretenimiento'
  | 'turismo'
  | 'negocios'
  | 'emergencia'
  | 'otros'

export type InicioCategory = {
  id: InicioCategoryId
  icon: string
  titleEs: string
  titleEn: string
  tint: string
}

export type InicioPlace = {
  id: string
  name: string
  distance: string
  category: string
  imageUrl: string
}

export type InicioActivity = {
  id: string
  friendName: string
  description: string
  time: string
  avatarColor: string
}

export type InicioUser = {
  name: string
  email: string
  avatarUrl: string | null
  initials: string
}

export const INICIO_CATEGORIES: InicioCategory[] = [
  { id: 'gastronomia', icon: 'restaurant', titleEs: 'Gastronomía', titleEn: 'Food', tint: '#FF9500' },
  { id: 'entretenimiento', icon: 'happy', titleEs: 'Entretenimiento', titleEn: 'Fun', tint: '#AF52DE' },
  { id: 'turismo', icon: 'compass', titleEs: 'Turismo', titleEn: 'Tourism', tint: '#34C759' },
  { id: 'negocios', icon: 'briefcase', titleEs: 'Negocios', titleEn: 'Business', tint: '#007AFF' },
  { id: 'emergencia', icon: 'medkit', titleEs: 'Emergencia', titleEn: 'Emergency', tint: '#FF3B30' },
  { id: 'otros', icon: 'apps', titleEs: 'Otros', titleEn: 'Other', tint: '#8E8E93' },
]

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`

export const INICIO_NEARBY: InicioPlace[] = [
  {
    id: 'lima-1',
    name: 'Central Restaurante',
    distance: '0.5 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1414235077428-338989a2e8c0'),
  },
  {
    id: 'lima-2',
    name: 'Miraflores Boardwalk',
    distance: '1.2 km',
    category: 'Turismo',
    imageUrl: img('photo-1469854523086-cc02fe5d8800'),
  },
  {
    id: 'lima-3',
    name: 'Larcomar',
    distance: '0.8 km',
    category: 'Negocios',
    imageUrl: img('photo-1441986300917-64674bd600d8'),
  },
  {
    id: 'lima-4',
    name: 'Huaca Pucllana',
    distance: '1.5 km',
    category: 'Turismo',
    imageUrl: img('photo-1523906834658-6e24ef2386f9'),
  },
]

export const INICIO_RECOMMENDED: InicioPlace[] = [
  {
    id: 'lima-5',
    name: 'Barranco Nightlife',
    distance: '3.4 km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1514933651103-005eec06c04b'),
  },
  {
    id: 'lima-6',
    name: 'Maido',
    distance: '2.1 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1517248135467-4c7edcad34c4'),
  },
  {
    id: 'lima-7',
    name: 'Museo Larco',
    distance: '4.0 km',
    category: 'Turismo',
    imageUrl: img('photo-1578662996442-48f60103fc96'),
  },
]

export const INICIO_ACTIVITIES: InicioActivity[] = [
  {
    id: 'a1',
    friendName: 'Camila R.',
    description: 'Guardó Central Restaurante',
    time: 'hace 12 min',
    avatarColor: '#FF9500',
  },
  {
    id: 'a2',
    friendName: 'Diego M.',
    description: 'Está explorando Barranco',
    time: 'hace 40 min',
    avatarColor: '#0A84FF',
  },
  {
    id: 'a3',
    friendName: 'Sofía P.',
    description: 'Calificó Huaca Pucllana ★ 4.8',
    time: 'hace 2 h',
    avatarColor: '#34C759',
  },
  {
    id: 'a4',
    friendName: 'Andrés V.',
    description: 'Compartió un plan en Larcomar',
    time: 'ayer',
    avatarColor: '#AF52DE',
  },
]

export const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

export const DEFAULT_INICIO_USER: InicioUser = {
  name: 'Ana Torres',
  email: 'ana.torres@trivai.app',
  avatarUrl: null,
  initials: 'AT',
}
