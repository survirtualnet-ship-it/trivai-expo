export type Locale = 'ES' | 'EN'

export type ZoneId = 'norte' | 'sur' | 'este' | 'oeste'

export type CategoryItem = {
  id: string
  titleEs: string
  titleEn: string
  icon: string
  tint: string
}

export type PlaceItem = {
  id: string
  name: string
  distance: string
  category: string
  imageUrl: string
  zone: ZoneId
}

export type QuickPlan = {
  id: string
  titleEs: string
  titleEn: string
  subtitleEs: string
  subtitleEn: string
  imageUrl: string
  zone: ZoneId
}

export type ActivityItem = {
  id: string
  friendName: string
  text: string
  time: string
  avatarColor: string
}

export type UserProfile = {
  name: string
  email: string
  initials: string
  avatarUrl: string | null
}

import { colors } from '../theme/colors'

export const ZONES: { id: ZoneId; labelEs: string; labelEn: string }[] = [
  { id: 'norte', labelEs: 'Norte', labelEn: 'North' },
  { id: 'sur', labelEs: 'Sur', labelEn: 'South' },
  { id: 'este', labelEs: 'Este', labelEn: 'East' },
  { id: 'oeste', labelEs: 'Oeste', labelEn: 'West' },
]

export const CATEGORIES: CategoryItem[] = [
  { id: 'gastro', titleEs: 'Gastronomía', titleEn: 'Food', icon: 'restaurant', tint: colors.tintOrange },
  { id: 'fun', titleEs: 'Entretenimiento', titleEn: 'Fun', icon: 'happy', tint: colors.tintPurple },
  { id: 'tourism', titleEs: 'Turismo', titleEn: 'Tourism', icon: 'compass', tint: colors.tintGreen },
  { id: 'biz', titleEs: 'Negocios', titleEn: 'Business', icon: 'briefcase', tint: colors.tintBlue },
  { id: 'emergency', titleEs: 'Emergencia', titleEn: 'Emergency', icon: 'medkit', tint: colors.tintRed },
  { id: 'other', titleEs: 'Otros', titleEn: 'Other', icon: 'apps', tint: colors.tintGray },
]

const img = (id: string) => `https://images.unsplash.com/${id}?w=640&q=80`

export const QUICK_PLANS: QuickPlan[] = [
  {
    id: 'qp1',
    titleEs: 'Cena + paseo',
    titleEn: 'Dinner + walk',
    subtitleEs: '2–3 horas · nocturno',
    subtitleEn: '2–3 hours · evening',
    imageUrl: img('photo-1414235077428-338989a2e8c0'),
    zone: 'sur',
  },
  {
    id: 'qp2',
    titleEs: 'Café + museo',
    titleEn: 'Coffee + museum',
    subtitleEs: 'Mañana cultural',
    subtitleEn: 'Cultural morning',
    imageUrl: img('photo-1501339847302-ac426a4a7cbb'),
    zone: 'norte',
  },
  {
    id: 'qp3',
    titleEs: 'Bar + evento',
    titleEn: 'Bar + event',
    subtitleEs: 'Noche con amigos',
    subtitleEn: 'Night with friends',
    imageUrl: img('photo-1514933651103-005eec06c04b'),
    zone: 'este',
  },
  {
    id: 'qp4',
    titleEs: 'Atardecer + cóctel',
    titleEn: 'Sunset + cocktail',
    subtitleEs: 'Vista al mar · golden hour',
    subtitleEn: 'Ocean view · golden hour',
    imageUrl: img('photo-1507525428034-b723cf961d3e'),
    zone: 'oeste',
  },
]

export const NEARBY_PLACES: PlaceItem[] = [
  {
    id: 'p1',
    name: 'Central',
    distance: '0.4 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1414235077428-338989a2e8c0'),
    zone: 'sur',
  },
  {
    id: 'p2',
    name: 'Malecón Miraflores',
    distance: '0.8 km',
    category: 'Turismo',
    imageUrl: img('photo-1469854523086-cc02fe5d8800'),
    zone: 'sur',
  },
  {
    id: 'p3',
    name: 'Larcomar',
    distance: '1.1 km',
    category: 'Negocios',
    imageUrl: img('photo-1441986300917-64674bd600d8'),
    zone: 'sur',
  },
  {
    id: 'p4',
    name: 'Huaca Pucllana',
    distance: '1.5 km',
    category: 'Turismo',
    imageUrl: img('photo-1523906834658-6e24ef2386f9'),
    zone: 'sur',
  },
  {
    id: 'p5',
    name: 'Plaza San Miguel',
    distance: '4.2 km',
    category: 'Negocios',
    imageUrl: img('photo-1441986300917-64674bd600d8'),
    zone: 'oeste',
  },
  {
    id: 'p6',
    name: 'Circuito Mágico',
    distance: '3.0 km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1514933651103-005eec06c04b'),
    zone: 'este',
  },
  {
    id: 'p7',
    name: 'Real Plaza Salaverry',
    distance: '5.1 km',
    category: 'Negocios',
    imageUrl: img('photo-1517248135467-4c7edcad34c4'),
    zone: 'norte',
  },
]

export const RECOMMENDED_PLACES: PlaceItem[] = [
  {
    id: 'r1',
    name: 'Barranco',
    distance: '3.2 km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1514933651103-005eec06c04b'),
    zone: 'sur',
  },
  {
    id: 'r2',
    name: 'Maido',
    distance: '2.0 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1517248135467-4c7edcad34c4'),
    zone: 'sur',
  },
  {
    id: 'r3',
    name: 'Museo Larco',
    distance: '4.1 km',
    category: 'Turismo',
    imageUrl: img('photo-1578662996442-48f60103fc96'),
    zone: 'oeste',
  },
]

export const TRENDING_PLACES: PlaceItem[] = [
  {
    id: 't1',
    name: 'Caleta de Pescadores',
    distance: '2.4 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1559339352-11d035aa65de'),
    zone: 'sur',
  },
  {
    id: 't2',
    name: 'Parque de la Reserva',
    distance: '3.5 km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1470229722913-7c0e2dbbafd3'),
    zone: 'este',
  },
  {
    id: 't3',
    name: 'Costa Verde Sunset',
    distance: '1.8 km',
    category: 'Turismo',
    imageUrl: img('photo-1507525428034-b723cf961d3e'),
    zone: 'oeste',
  },
]

export const FOR_YOU_PLACES: PlaceItem[] = [
  {
    id: 'f1',
    name: 'Café Bisetti',
    distance: '1.0 km',
    category: 'Gastronomía',
    imageUrl: img('photo-1501339847302-ac426a4a7cbb'),
    zone: 'sur',
  },
  {
    id: 'f2',
    name: 'Galería Lucia de la Puente',
    distance: '2.7 km',
    category: 'Entretenimiento',
    imageUrl: img('photo-1578662996442-48f60103fc96'),
    zone: 'sur',
  },
  {
    id: 'f3',
    name: 'Mirador Norte',
    distance: '6.0 km',
    category: 'Turismo',
    imageUrl: img('photo-1469854523086-cc02fe5d8800'),
    zone: 'norte',
  },
]

export const ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    friendName: 'Camila R.',
    text: 'Guardó Central en favoritos',
    time: 'hace 12 min',
    avatarColor: colors.tintOrange,
  },
  {
    id: 'a2',
    friendName: 'Diego M.',
    text: 'Está explorando Barranco',
    time: 'hace 40 min',
    avatarColor: colors.accent,
  },
  {
    id: 'a3',
    friendName: 'Sofía P.',
    text: 'Calificó Huaca Pucllana',
    time: 'hace 2 h',
    avatarColor: colors.tintGreen,
  },
  {
    id: 'a4',
    friendName: 'Andrés V.',
    text: 'Compartió un plan en Larcomar',
    time: 'ayer',
    avatarColor: colors.tintPurple,
  },
]

export const DEFAULT_USER: UserProfile = {
  name: 'Ana Torres',
  email: 'ana.torres@trivai.app',
  initials: 'AT',
  avatarUrl: null,
}

export const LIMA_REGION = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

export function zoneLabel(zone: ZoneId, locale: Locale): string {
  const match = ZONES.find(z => z.id === zone)
  if (!match) return zone
  return locale === 'EN' ? match.labelEn : match.labelEs
}

export function filterByZone(places: PlaceItem[], zone: ZoneId | null) {
  if (!zone) return places
  return places.filter(p => p.zone === zone)
}

export function filterQuickPlansByZone(plans: QuickPlan[], zone: ZoneId | null) {
  if (!zone) return plans
  return plans.filter(p => p.zone === zone)
}
