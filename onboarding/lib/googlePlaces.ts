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

const MOCK_PLACES: PlaceAutocompleteResult[] = [
  {
    placeId: 'mock-001',
    name: 'Mercado Gourmet 360',
    address: 'Av. Roca y Coronado 360, Equipetrol, Santa Cruz',
  },
  {
    placeId: 'mock-002',
    name: 'Cine Center VIP',
    address: 'Av. San Martín, Equipetrol, Santa Cruz',
  },
  {
    placeId: 'mock-003',
    name: 'Los Tajibos Hotel',
    address: 'Av. San Martín 400, Equipetrol, Santa Cruz',
  },
  {
    placeId: 'mock-004',
    name: 'Casa del Camba',
    address: 'Calle Potosí 145, Centro, Santa Cruz',
  },
  {
    placeId: 'mock-005',
    name: 'Hospital San Juan de Dios',
    address: 'Av. Busch 1000, Santa Cruz',
  },
]

export async function fetchPlaceAutocomplete(
  query: string,
): Promise<PlaceAutocompleteResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const key = ONBOARDING_CONFIG.googleMapsKey
  if (!key || key === 'YOUR_GOOGLE_PLACES_API_KEY') {
    return MOCK_PLACES.filter(
      p =>
        p.name.toLowerCase().includes(q.toLowerCase())
        || p.address.toLowerCase().includes(q.toLowerCase()),
    )
  }

  try {
    const params = new URLSearchParams({
      input: q,
      key,
      types: 'establishment',
      components: 'country:bo',
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
      return MOCK_PLACES.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    }

    return json.predictions.map(p => ({
      placeId: p.place_id,
      name: p.structured_formatting.main_text,
      address: p.structured_formatting.secondary_text,
    }))
  } catch {
    return MOCK_PLACES.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  }
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (placeId.startsWith('mock-')) {
    const mock = MOCK_PLACES.find(p => p.placeId === placeId)
    if (!mock) return null
    return {
      placeId: mock.placeId,
      name: mock.name,
      address: mock.address,
      lat: -17.7833 + Math.random() * 0.02,
      lng: -63.1821 + Math.random() * 0.02,
    }
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
