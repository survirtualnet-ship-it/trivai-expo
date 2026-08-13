import { supabase, type Place } from '@/lib/supabase'
import { refreshPlaceFromGoogle } from '@/lib/places/resolvePlace'
import type { Company } from '../types'

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'

const PLACEHOLDER_PHOTO = /unsplash\.com/i

function isRealPhoto(url: string | undefined | null): boolean {
  const value = url?.trim()
  if (!value) return false
  return !PLACEHOLDER_PHOTO.test(value)
}

function firstRealPhoto(photos: string[] | null | undefined): string {
  return (photos ?? []).find(isRealPhoto)?.trim() ?? ''
}

/** Map a Supabase place (claimed business) into the company dashboard model. */
export function companyFromPlace(
  place: Place,
  email?: string | null,
): Company {
  const photo = firstRealPhoto(place.photos)
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
    profileImage: photo,
    rating: place.rating_avg ?? 0,
    reviewCount: place.rating_count ?? 0,
    isVerified: place.is_verified ?? false,
    isDemoCompany: false,
  }
}

async function attachCustomLogo(company: Company): Promise<Company> {
  const { data } = await supabase
    .from('trivai_business')
    .select('custom_logo_url')
    .eq('place_id', company.id)
    .maybeSingle()

  const customLogoUrl = data?.custom_logo_url?.trim()
  if (!customLogoUrl) return company
  return { ...company, customLogoUrl }
}

/**
 * Load company from Supabase by place UUID.
 * Refreshes Google photos when the enrichment row has none yet.
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

  let place = data as Place
  const googlePlaceId = place.google_place_id?.trim()
  const hasGooglePhoto = firstRealPhoto(place.photos).length > 0

  if (googlePlaceId && !hasGooglePhoto) {
    await refreshPlaceFromGoogle(placeId, googlePlaceId)
    const { data: refreshed } = await supabase
      .from('places')
      .select('*')
      .eq('id', placeId)
      .maybeSingle()
    if (refreshed) place = refreshed as Place
  }

  return attachCustomLogo(companyFromPlace(place, email))
}

/** Persist Trivai-editable fields — Google canonical fields are read-only here. */
export async function updatePlaceFromCompany(
  company: Company,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from('places')
    .update({
      description: company.description || null,
      phone: company.phone || null,
      website: company.website || null,
    })
    .eq('id', company.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
