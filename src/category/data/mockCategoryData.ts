import type { ZoneId } from '@/src/data/mock'

export type CategoryId =
  | 'gastro'
  | 'fun'
  | 'tourism'
  | 'biz'
  | 'emergency'
  | 'other'

export type Locale = 'ES' | 'EN'

export type Subcategory = {
  id: string
  nameEs: string
  nameEn: string
  icon: string
}

export type CategoryDefinition = {
  id: CategoryId
  nameEs: string
  nameEn: string
  icon: string
  tint: string
  subcategories: Subcategory[]
}

export type CategoryPlace = {
  id: string
  name: string
  categoryId: CategoryId
  subcategoryId: string
  zone: ZoneId
  imageUrl: string
  rating: number
  distanceKm: number
  categoryLabel: string
  isTrending: boolean
  isRecommended: boolean
  isForYou: boolean
}

const img = (id: string) => `https://images.unsplash.com/${id}?w=640&q=80`

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'emergency',
    nameEs: 'Emergencias',
    nameEn: 'Emergency',
    icon: 'medkit',
    tint: '#FF4D6A',
    subcategories: [
      { id: 'hospitales', nameEs: 'Hospitales', nameEn: 'Hospitals', icon: 'medical' },
      { id: 'farmacias', nameEs: 'Farmacias', nameEn: 'Pharmacies', icon: 'fitness' },
      { id: 'policia', nameEs: 'Policía', nameEn: 'Police', icon: 'shield-checkmark' },
      { id: 'ayuda', nameEs: 'Ayuda', nameEn: 'Help', icon: 'call' },
    ],
  },
  {
    id: 'gastro',
    nameEs: 'Comida',
    nameEn: 'Food',
    icon: 'restaurant',
    tint: '#FF9500',
    subcategories: [
      { id: 'restaurantes', nameEs: 'Restaurantes', nameEn: 'Restaurants', icon: 'restaurant' },
      { id: 'cafes', nameEs: 'Cafés', nameEn: 'Cafés', icon: 'cafe' },
      { id: 'bares', nameEs: 'Bares', nameEn: 'Bars', icon: 'wine' },
      { id: 'delivery', nameEs: 'Delivery', nameEn: 'Delivery', icon: 'bicycle' },
    ],
  },
  {
    id: 'fun',
    nameEs: 'Ocio',
    nameEn: 'Fun',
    icon: 'happy',
    tint: '#AF52DE',
    subcategories: [
      { id: 'cine', nameEs: 'Cine', nameEn: 'Cinema', icon: 'film' },
      { id: 'musica', nameEs: 'Música', nameEn: 'Music', icon: 'musical-notes' },
      { id: 'nightlife', nameEs: 'Vida nocturna', nameEn: 'Nightlife', icon: 'moon' },
      { id: 'juegos', nameEs: 'Juegos', nameEn: 'Games', icon: 'game-controller' },
    ],
  },
  {
    id: 'tourism',
    nameEs: 'Turismo',
    nameEn: 'Tourism',
    icon: 'compass',
    tint: '#34C759',
    subcategories: [
      { id: 'museos', nameEs: 'Museos', nameEn: 'Museums', icon: 'color-palette' },
      { id: 'parques', nameEs: 'Parques', nameEn: 'Parks', icon: 'leaf' },
      { id: 'tours', nameEs: 'Tours', nameEn: 'Tours', icon: 'map' },
      { id: 'miradores', nameEs: 'Miradores', nameEn: 'Viewpoints', icon: 'eye' },
    ],
  },
  {
    id: 'biz',
    nameEs: 'Negocios',
    nameEn: 'Business',
    icon: 'briefcase',
    tint: '#007AFF',
    subcategories: [
      { id: 'coworking', nameEs: 'Coworking', nameEn: 'Coworking', icon: 'laptop' },
      { id: 'shopping', nameEs: 'Shopping', nameEn: 'Shopping', icon: 'bag-handle' },
      { id: 'servicios', nameEs: 'Servicios', nameEn: 'Services', icon: 'construct' },
    ],
  },
  {
    id: 'other',
    nameEs: 'Otros',
    nameEn: 'Other',
    icon: 'apps',
    tint: '#8E8E93',
    subcategories: [
      { id: 'bienestar', nameEs: 'Bienestar', nameEn: 'Wellness', icon: 'heart' },
      { id: 'mascotas', nameEs: 'Mascotas', nameEn: 'Pets', icon: 'paw' },
    ],
  },
]

export const CATEGORY_PLACES: CategoryPlace[] = [
  // —— Emergencias ——
  { id: 'cp-001', name: 'Hospital San Juan de Dios', categoryId: 'emergency', subcategoryId: 'hospitales', zone: 'sur', imageUrl: img('photo-1519494026892-80bbd02d6bd0'), rating: 4.2, distanceKm: 1.8, categoryLabel: 'Hospital', isTrending: false, isRecommended: true, isForYou: true },
  { id: 'cp-002', name: 'Clínica Foianini', categoryId: 'emergency', subcategoryId: 'hospitales', zone: 'norte', imageUrl: img('photo-1586773868418-34628b27e299'), rating: 4.6, distanceKm: 3.4, categoryLabel: 'Clínica', isTrending: true, isRecommended: true, isForYou: false },
  { id: 'cp-003', name: 'Farmacia Chávez · 24h', categoryId: 'emergency', subcategoryId: 'farmacias', zone: 'sur', imageUrl: img('photo-1584308666744-24d5c474f2ae'), rating: 4.4, distanceKm: 0.6, categoryLabel: 'Farmacia', isTrending: true, isRecommended: false, isForYou: true },
  { id: 'cp-004', name: 'Farmacia Boliviana', categoryId: 'emergency', subcategoryId: 'farmacias', zone: 'este', imageUrl: img('photo-1576601538824-6c13a7d6b6d1'), rating: 4.1, distanceKm: 2.2, categoryLabel: 'Farmacia', isTrending: false, isRecommended: true, isForYou: true },
  { id: 'cp-005', name: 'Policía Turística Centro', categoryId: 'emergency', subcategoryId: 'policia', zone: 'sur', imageUrl: img('photo-1521791136064-7986c2920216'), rating: 4.0, distanceKm: 1.1, categoryLabel: 'Policía', isTrending: false, isRecommended: true, isForYou: false },
  { id: 'cp-006', name: 'Línea de ayuda 800', categoryId: 'emergency', subcategoryId: 'ayuda', zone: 'oeste', imageUrl: img('photo-1573497019940-1c28c88d329a'), rating: 4.8, distanceKm: 0.3, categoryLabel: 'Ayuda', isTrending: true, isRecommended: true, isForYou: true },

  // —— Comida ——
  { id: 'cp-007', name: 'Mercado Gourmet 360', categoryId: 'gastro', subcategoryId: 'restaurantes', zone: 'norte', imageUrl: img('photo-1559339352-11d035aa65de'), rating: 4.8, distanceKm: 0.9, categoryLabel: 'Restaurante', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-008', name: 'Casa del Camba', categoryId: 'gastro', subcategoryId: 'restaurantes', zone: 'sur', imageUrl: img('photo-1504674900247-0877df9cc836'), rating: 4.6, distanceKm: 1.4, categoryLabel: 'Restaurante', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-009', name: 'Café del Parque', categoryId: 'gastro', subcategoryId: 'cafes', zone: 'norte', imageUrl: img('photo-1453614512568-c4024d13c247'), rating: 4.3, distanceKm: 2.0, categoryLabel: 'Café', isTrending: false, isRecommended: true, isForYou: true },
  { id: 'cp-010', name: 'Café 24 de Septiembre', categoryId: 'gastro', subcategoryId: 'cafes', zone: 'sur', imageUrl: img('photo-1501339847302-ac426a4a7cbb'), rating: 4.5, distanceKm: 0.7, categoryLabel: 'Café', isTrending: true, isRecommended: false, isForYou: true },
  { id: 'cp-011', name: 'Bar La Rinconada', categoryId: 'gastro', subcategoryId: 'bares', zone: 'norte', imageUrl: img('photo-1514933651103-005eec06c04b'), rating: 4.2, distanceKm: 1.6, categoryLabel: 'Bar', isTrending: true, isRecommended: false, isForYou: false },
  { id: 'cp-012', name: 'Delivery Express SCZ', categoryId: 'gastro', subcategoryId: 'delivery', zone: 'este', imageUrl: img('photo-1526368890839-7793c2a2b4a7'), rating: 4.4, distanceKm: 0.5, categoryLabel: 'Delivery', isTrending: true, isRecommended: true, isForYou: true },

  // —— Ocio ——
  { id: 'cp-013', name: 'Cine Center VIP', categoryId: 'fun', subcategoryId: 'cine', zone: 'norte', imageUrl: img('photo-1489599849927-2ee91cede3ba'), rating: 4.3, distanceKm: 1.9, categoryLabel: 'Cine', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-014', name: 'Boliche Neon', categoryId: 'fun', subcategoryId: 'nightlife', zone: 'norte', imageUrl: img('photo-1470229722913-7c0e2dbbafd3'), rating: 4.0, distanceKm: 2.5, categoryLabel: 'Discoteca', isTrending: true, isRecommended: false, isForYou: false },
  { id: 'cp-015', name: 'Jazz Club Equipetrol', categoryId: 'fun', subcategoryId: 'musica', zone: 'norte', imageUrl: img('photo-1493225457124-a3eb161ffa5f'), rating: 4.7, distanceKm: 1.2, categoryLabel: 'Música', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-016', name: 'Bowling & Games SCZ', categoryId: 'fun', subcategoryId: 'juegos', zone: 'oeste', imageUrl: img('photo-1511882150382-421056c89033'), rating: 4.1, distanceKm: 4.2, categoryLabel: 'Juegos', isTrending: false, isRecommended: true, isForYou: true },

  // —— Turismo ——
  { id: 'cp-017', name: 'Museo Etno-Folklórico', categoryId: 'tourism', subcategoryId: 'museos', zone: 'sur', imageUrl: img('photo-1578662996442-48f60103fc96'), rating: 4.5, distanceKm: 1.3, categoryLabel: 'Museo', isTrending: false, isRecommended: true, isForYou: true },
  { id: 'cp-018', name: 'Parque Urbano', categoryId: 'tourism', subcategoryId: 'parques', zone: 'norte', imageUrl: img('photo-1441974231531-c6227db76b6e'), rating: 4.5, distanceKm: 2.1, categoryLabel: 'Parque', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-019', name: 'Tour Histórico Centro', categoryId: 'tourism', subcategoryId: 'tours', zone: 'sur', imageUrl: img('photo-1523906834658-6e24ef2386f9'), rating: 4.6, distanceKm: 0.8, categoryLabel: 'Tour', isTrending: true, isRecommended: true, isForYou: false },
  { id: 'cp-020', name: 'Mirador Cristo Redentor', categoryId: 'tourism', subcategoryId: 'miradores', zone: 'oeste', imageUrl: img('photo-1469854523086-cc02fe5d8800'), rating: 4.8, distanceKm: 3.8, categoryLabel: 'Mirador', isTrending: true, isRecommended: true, isForYou: true },

  // —— Negocios ——
  { id: 'cp-021', name: 'Hub Cowork SCZ', categoryId: 'biz', subcategoryId: 'coworking', zone: 'norte', imageUrl: img('photo-1497366216548-37526070297c'), rating: 4.4, distanceKm: 1.0, categoryLabel: 'Coworking', isTrending: false, isRecommended: true, isForYou: true },
  { id: 'cp-022', name: 'Ventura Mall', categoryId: 'biz', subcategoryId: 'shopping', zone: 'sur', imageUrl: img('photo-1441986300917-64674bd600d8'), rating: 4.3, distanceKm: 2.4, categoryLabel: 'Shopping', isTrending: true, isRecommended: true, isForYou: false },
  { id: 'cp-023', name: 'Centro de Copiado Rápido', categoryId: 'biz', subcategoryId: 'servicios', zone: 'este', imageUrl: img('photo-1454165804606-c3d57bc86b40'), rating: 4.0, distanceKm: 1.7, categoryLabel: 'Servicios', isTrending: false, isRecommended: false, isForYou: true },

  // —— Otros ——
  { id: 'cp-024', name: 'Spa Urbano SCZ', categoryId: 'other', subcategoryId: 'bienestar', zone: 'norte', imageUrl: img('photo-1540555700478-4be289fbecef'), rating: 4.6, distanceKm: 2.8, categoryLabel: 'Bienestar', isTrending: true, isRecommended: true, isForYou: true },
  { id: 'cp-025', name: 'Pet Care Equipetrol', categoryId: 'other', subcategoryId: 'mascotas', zone: 'norte', imageUrl: img('photo-1450778869180-41d060eda399'), rating: 4.5, distanceKm: 1.5, categoryLabel: 'Mascotas', isTrending: false, isRecommended: true, isForYou: true },
]

export function getCategoryById(id: string | undefined): CategoryDefinition | undefined {
  return CATEGORY_DEFINITIONS.find(c => c.id === id)
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function filterPlaces(
  places: CategoryPlace[],
  categoryId: CategoryId,
  subcategoryId: string | null,
  zone: ZoneId | null,
): CategoryPlace[] {
  return places.filter(p => {
    if (p.categoryId !== categoryId) return false
    if (subcategoryId && p.subcategoryId !== subcategoryId) return false
    if (zone && p.zone !== zone) return false
    return true
  })
}

export type CategorySections = {
  nearby: CategoryPlace[]
  trending: CategoryPlace[]
  forYou: CategoryPlace[]
  recommended: CategoryPlace[]
}

const SECTION_LIMIT = 8

export function buildSections(places: CategoryPlace[]): CategorySections {
  const byDistance = [...places].sort((a, b) => a.distanceKm - b.distanceKm)
  return {
    nearby: byDistance.slice(0, SECTION_LIMIT),
    trending: places.filter(p => p.isTrending).slice(0, SECTION_LIMIT),
    forYou: places.filter(p => p.isForYou).slice(0, SECTION_LIMIT),
    recommended: places.filter(p => p.isRecommended).slice(0, SECTION_LIMIT),
  }
}
