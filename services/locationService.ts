import * as Location from 'expo-location'
import { Platform } from 'react-native'
import { getCurrentCoords, requestLocationPermission, type Coords } from '@/lib/geolocation'
import { CACHE_KEYS, readCache, writeCache } from '@/lib/homeCache'

export type LocationPermission = 'undetermined' | 'granted' | 'denied'

export type UserLocationProfile = {
  latitude: number
  longitude: number
  city: string
  country: string
  countryCode: string
  region: string | null
  district: string | null
  source: 'gps' | 'manual' | 'cache' | 'default'
}

export type ManualCityInput = {
  city: string
  country?: string
  countryCode?: string
  latitude?: number
  longitude?: number
}

const SIGNIFICANT_MOVE_KM = 5

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180)
      * Math.cos((b.lat * Math.PI) / 180)
      * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function countryCodeFromName(country: string | null | undefined): string {
  const c = (country ?? '').toLowerCase()
  if (c.includes('peru') || c.includes('perú')) return 'PE'
  if (c.includes('bolivia')) return 'BO'
  if (c.includes('argentina')) return 'AR'
  if (c.includes('chile')) return 'CL'
  if (c.includes('colombia')) return 'CO'
  if (c.includes('brazil') || c.includes('brasil')) return 'BR'
  if (c.includes('mexico') || c.includes('méxico')) return 'MX'
  if (c.includes('united states') || c.includes('usa')) return 'US'
  if (c.includes('spain') || c.includes('españa')) return 'ES'
  if (c.includes('france') || c.includes('francia')) return 'FR'
  if (c.includes('germany') || c.includes('deutschland') || c.includes('alemania')) return 'DE'
  if (c.includes('united kingdom') || c.includes('england') || c.includes('uk')) return 'GB'
  return ''
}

async function reverseGeocode(lat: number, lng: number): Promise<Partial<UserLocationProfile>> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
    const hit = results[0]
    if (!hit) return {}
    const country = hit.country ?? ''
    return {
      city: hit.city ?? hit.subregion ?? hit.region ?? '',
      country,
      countryCode: hit.isoCountryCode ?? countryCodeFromName(country),
      region: hit.region ?? hit.subregion ?? null,
      district: hit.district ?? hit.name ?? null,
    }
  } catch {
    return {}
  }
}

async function geocodeCityName(city: string): Promise<Coords | null> {
  try {
    const results = await Location.geocodeAsync(city)
    const hit = results[0]
    if (!hit) return null
    return { lat: hit.latitude, lng: hit.longitude }
  } catch {
    return null
  }
}

export async function getManualCity(): Promise<ManualCityInput | null> {
  return readCache<ManualCityInput>(CACHE_KEYS.manualCity)
}

export async function setManualCity(input: ManualCityInput): Promise<UserLocationProfile | null> {
  await writeCache(CACHE_KEYS.manualCity, input)

  let lat = input.latitude
  let lng = input.longitude
  if (lat == null || lng == null) {
    const geo = await geocodeCityName(
      [input.city, input.country].filter(Boolean).join(', '),
    )
    if (!geo) return null
    lat = geo.lat
    lng = geo.lng
  }

  const profile: UserLocationProfile = {
    latitude: lat,
    longitude: lng,
    city: input.city,
    country: input.country ?? '',
    countryCode: input.countryCode ?? countryCodeFromName(input.country),
    region: null,
    district: null,
    source: 'manual',
  }
  await writeCache(CACHE_KEYS.location, profile)
  return profile
}

export async function resolveLocationProfile(options?: {
  forceRefresh?: boolean
}): Promise<{
  profile: UserLocationProfile | null
  permission: LocationPermission
  offline: boolean
}> {
  const manual = await getManualCity()
  if (manual?.city) {
    const profile = await setManualCity(manual)
    const { status } = await Location.getForegroundPermissionsAsync()
    const permission: LocationPermission =
      status === 'granted' ? 'granted' : 'denied'
    return { profile, permission, offline: false }
  }

  const cached = await readCache<UserLocationProfile>(CACHE_KEYS.location)
  const granted = await requestLocationPermission()
  const permission: LocationPermission = granted ? 'granted' : 'denied'

  if (!granted) {
    if (cached) {
      return { profile: { ...cached, source: 'cache' }, permission, offline: true }
    }
    return { profile: null, permission, offline: false }
  }

  const coords = await getCurrentCoords()
  if (!coords) {
    if (cached) {
      return { profile: { ...cached, source: 'cache' }, permission, offline: true }
    }
    return { profile: null, permission, offline: false }
  }

  if (
    !options?.forceRefresh
    && cached
    && haversineKm(coords, { lat: cached.latitude, lng: cached.longitude }) < SIGNIFICANT_MOVE_KM
  ) {
    return {
      profile: { ...cached, latitude: coords.lat, longitude: coords.lng, source: 'cache' },
      permission,
      offline: false,
    }
  }

  const geo = await reverseGeocode(coords.lat, coords.lng)
  const profile: UserLocationProfile = {
    latitude: coords.lat,
    longitude: coords.lng,
    city: geo.city ?? cached?.city ?? '',
    country: geo.country ?? cached?.country ?? '',
    countryCode: geo.countryCode ?? cached?.countryCode ?? '',
    region: geo.region ?? null,
    district: geo.district ?? null,
    source: 'gps',
  }

  await writeCache(CACHE_KEYS.location, profile)
  return { profile, permission, offline: false }
}

export async function watchLocationSignificantChange(
  onChange: (profile: UserLocationProfile) => void,
): Promise<() => void> {
  if (Platform.OS === 'web') return () => {}

  let last = await readCache<UserLocationProfile>(CACHE_KEYS.location)
  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 500,
      timeInterval: 60_000,
    },
    async pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      if (last && haversineKm(coords, { lat: last.latitude, lng: last.longitude }) < SIGNIFICANT_MOVE_KM) {
        return
      }
      const geo = await reverseGeocode(coords.lat, coords.lng)
      const profile: UserLocationProfile = {
        latitude: coords.lat,
        longitude: coords.lng,
        city: geo.city ?? last?.city ?? '',
        country: geo.country ?? last?.country ?? '',
        countryCode: geo.countryCode ?? last?.countryCode ?? '',
        region: geo.region ?? null,
        district: geo.district ?? null,
        source: 'gps',
      }
      last = profile
      await writeCache(CACHE_KEYS.location, profile)
      onChange(profile)
    },
  )

  return () => sub.remove()
}
