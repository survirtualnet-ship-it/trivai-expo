import type { Place } from '@/lib/supabase'
import { normalizeCategory } from '@/lib/categories'
import { calcIsOpen } from '@/lib/hours'
import { haversineKm } from '@/lib/eventUtils'
import type { Coords } from '@/lib/geolocation'
import { estimatePriceTier, type PriceTier } from '@/lib/explorerCategories'

export interface PlaceDetail {
  id: string
  name: string
  description: string
  category: string
  rating: number
  reviewCount: number
  priceLevel?: 1 | 2 | 3
  priceLabel?: PriceTier
  images: string[]
  address: string
  distance?: number
  coordinates: { lat: number; lng: number }
  tags: string[]
  idealFor: IdealForTag[]
  isOpen: boolean
  openingHours: string[]
  phone?: string
  website?: string
  servicesLabel?: string
  servicesUrl?: string
  isFeatured: boolean
  isSponsored: boolean
  isVerified: boolean
  hours?: Record<string, string> | null
}

export type IdealForTag = 'Pareja' | 'Amigos' | 'Familia'

const DIAS_ORDER = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

function priceTierToLevel(tier: PriceTier): 1 | 2 | 3 {
  if (tier === '€') return 1
  if (tier === '€€') return 2
  return 3
}

function deriveIdealFor(place: Place): IdealForTag[] {
  const tags: IdealForTag[] = []
  const cat = normalizeCategory(place.category)

  if (cat === 'Gastronomía') {
    if ((place.rating_avg ?? 0) >= 4.2) tags.push('Pareja')
    tags.push('Amigos', 'Familia')
  } else if (cat === 'Parques') {
    tags.push('Familia', 'Amigos', 'Pareja')
  } else if (cat === 'Entretenimiento') {
    tags.push('Amigos', 'Pareja', 'Familia')
  } else {
    tags.push('Amigos', 'Familia')
  }

  return [...new Set(tags)].slice(0, 3)
}

function deriveServices(place: Place): { label: string; url?: string } | null {
  const cat = normalizeCategory(place.category)
  if (place.website) {
    return cat === 'Gastronomía'
      ? { label: 'Ver menú', url: place.website }
      : { label: 'Ver servicios', url: place.website }
  }
  if (cat === 'Gastronomía') return { label: 'Comida local y bebidas' }
  if (cat === 'Entretenimiento') return { label: 'Entretenimiento y actividades' }
  if (cat === 'Parques') return { label: 'Espacios al aire libre' }
  return null
}

function deriveTags(place: Place): string[] {
  const tags: string[] = []
  const cat = normalizeCategory(place.category)

  if (place.is_featured) tags.push('Recomendado')
  if (place.is_sponsored) tags.push('Patrocinado')
  if ((place.rating_avg ?? 0) >= 4.5) tags.push('Popular')
  if (place.is_verified) tags.push('Verificado')

  if (cat === 'Gastronomía') {
    tags.push('Gastronomía local')
    if ((place.rating_avg ?? 0) >= 4.2) tags.push('Ideal para compartir')
  }
  if (cat === 'Entretenimiento') tags.push('Plan social')
  if (cat === 'Parques') tags.push('Al aire libre', 'Familiar')

  if ((place.rating_count ?? 0) >= 20) tags.push('Muy visitado')
  if ((place.rating_avg ?? 0) >= 4 && (place.rating_avg ?? 0) < 4.3) tags.push('Buena relación calidad-precio')

  return [...new Set(tags)].slice(0, 6)
}

function formatOpeningHours(hours: Record<string, string> | null | undefined): string[] {
  if (!hours) return []
  return DIAS_ORDER
    .filter(d => hours[d])
    .map(d => `${d.charAt(0).toUpperCase()}${d.slice(1)}: ${hours[d]}`)
}

export function mapPlaceToDetail(
  place: Place,
  userCoords?: Coords | null,
): PlaceDetail {
  const priceLabel = estimatePriceTier(place.rating_avg)
  const lat = place.latitude ?? 0
  const lng = place.longitude ?? 0

  let distance: number | undefined
  if (userCoords && place.latitude != null && place.longitude != null) {
    distance = haversineKm(userCoords.lat, userCoords.lng, place.latitude, place.longitude)
  }

  const services = deriveServices(place)

  return {
    id: place.id,
    name: place.name,
    description: place.description?.trim() || '',
    category: place.category,
    rating: place.rating_avg ?? 0,
    reviewCount: place.rating_count ?? 0,
    priceLevel: priceTierToLevel(priceLabel),
    priceLabel,
    images: place.photos?.length ? place.photos : [],
    address: place.address?.trim() || place.city || 'Santa Cruz de la Sierra',
    distance,
    coordinates: { lat, lng },
    tags: deriveTags(place),
    idealFor: deriveIdealFor(place),
    isOpen: calcIsOpen(place.hours, place.is_open),
    openingHours: formatOpeningHours(place.hours),
    phone: place.phone ?? undefined,
    website: place.website ?? undefined,
    servicesLabel: services?.label,
    servicesUrl: services?.url,
    isFeatured: place.is_featured ?? false,
    isSponsored: place.is_sponsored ?? false,
    isVerified: place.is_verified ?? false,
    hours: place.hours,
  }
}

export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

export function canReserve(place: PlaceDetail): boolean {
  return !!(place.website || place.phone)
}

export function whatsappUrl(phone: string, placeName: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('591') ? digits : `591${digits.replace(/^0/, '')}`
  const msg = encodeURIComponent(`Hola, vi ${placeName} en Trivai y me gustaría más información.`)
  return `https://wa.me/${withCountry}?text=${msg}`
}

export function hasContact(place: PlaceDetail): boolean {
  return !!place.phone
}

export function hasDirections(place: PlaceDetail): boolean {
  return place.coordinates.lat !== 0 || place.coordinates.lng !== 0
}
