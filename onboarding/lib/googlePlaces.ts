import { ONBOARDING_CONFIG } from './config'

export type PlaceAutocompleteResult = {
  placeId: string
  name: string
  address: string
}

export type PlaceDetails = {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
}

export async function fetchPlaceAutocomplete(
  query: string,
): Promise<PlaceAutocompleteResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const key = ONBOARDING_CONFIG.googleMapsKey
  if (!key || key === 'YOUR_GOOGLE_PLACES_API_KEY') {
    return []
  }

  try {
    const params = new URLSearchParams({
      input: q,
      key,
      types: 'establishment',
      language: 'es',
    })
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
    )
    const json = (await res.json()) as {
      status: string
      predictions?: {
        place_id: string
        structured_formatting: { main_text: string; secondary_text: string }
      }[]
    }

    if (json.status !== 'OK' || !json.predictions?.length) {
      return []
    }

    return json.predictions.map(p => ({
      placeId: p.place_id,
      name: p.structured_formatting.main_text,
      address: p.structured_formatting.secondary_text,
    }))
  } catch {
    return []
  }
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (placeId.startsWith('mock-')) {
    return null
  }

  const key = ONBOARDING_CONFIG.googleMapsKey
  if (!key || key === 'YOUR_GOOGLE_PLACES_API_KEY') return null

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      key,
      fields: 'place_id,name,formatted_address,geometry',
      language: 'es',
    })
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    )
    const json = (await res.json()) as {
      status: string
      result?: {
        place_id: string
        name: string
        formatted_address: string
        geometry: { location: { lat: number; lng: number } }
      }
    }

    if (json.status !== 'OK' || !json.result) return null

    return {
      placeId: json.result.place_id,
      name: json.result.name,
      address: json.result.formatted_address,
      lat: json.result.geometry.location.lat,
      lng: json.result.geometry.location.lng,
    }
  } catch {
    return null
  }
}
