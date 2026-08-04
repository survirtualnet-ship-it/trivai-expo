import { supabase, type Place } from '@/lib/supabase'
import type { Company } from '../types'

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80'

/** Map a Supabase place (claimed business) into the company dashboard model. */
export function companyFromPlace(
  place: Place,
  email?: string | null,
): Company {
  const photo = place.photos?.[0]
  return {
    id: place.id,
    name: place.name,
    category: place.category || 'Negocio',
    description: place.description ?? '',
    email: email ?? 'contacto@negocio.com',
    location: {
      latitude: place.latitude ?? 0,
      longitude: place.longitude ?? 0,
      address: place.address ?? place.city ?? '',
    },
    phone: place.phone ?? '',
    whatsapp: place.phone ?? '',
    website: place.website ?? '',
    coverImage: photo || DEFAULT_COVER,
    profileImage: photo || DEFAULT_AVATAR,
    rating: place.rating_avg ?? 0,
    isDemoCompany: false,
  }
}

/**
 * Load company from Supabase by place UUID.
 * Returns null if the place does not exist.
 */
export async function fetchCompanyByPlaceId(
  placeId: string,
  email?: string | null,
): Promise<Company | null> {
  if (!placeId) return null

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', placeId)
    .maybeSingle()

  if (error || !data) {
    console.warn('[empresa] fetch place', error?.message ?? 'not found')
    return null
  }

  return companyFromPlace(data as Place, email)
}

/** Persist basic editable company fields back to places. */
export async function updatePlaceFromCompany(
  company: Company,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('places')
    .update({
      name: company.name,
      description: company.description || null,
      category: company.category,
      phone: company.phone || null,
      website: company.website || null,
      address: company.location.address || null,
    })
    .eq('id', company.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
