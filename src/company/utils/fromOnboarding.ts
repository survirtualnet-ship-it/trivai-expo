import type { BusinessData } from '@/onboarding/store/onboardingStore'
import type { Company } from '../types'

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'

export function companyIdFromPlaceId(placeId: string): string {
  const slug = placeId.replace(/[^a-zA-Z0-9]/g, '').slice(-10) || Date.now().toString(36)
  return `co-${slug}`
}

export function companyFromBusinessData(
  data: BusinessData,
  email?: string,
  placeUuid?: string,
): Company {
  return {
    id: placeUuid ?? companyIdFromPlaceId(data.placeId),
    name: data.name,
    category: data.category ?? 'Negocio',
    description: data.description ?? '',
    email: email ?? 'contacto@negocio.com',
    location: {
      latitude: data.lat,
      longitude: data.lng,
      address: data.address,
    },
    phone: data.phone ?? '',
    whatsapp: data.whatsapp ?? data.phone ?? '',
    website: data.website ?? '',
    coverImage: DEFAULT_COVER,
    profileImage: DEFAULT_AVATAR,
    rating: 0,
  }
}
