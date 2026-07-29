import type { Coords } from '@/lib/geolocation'

export type MapRegion = {
  center: Coords
  bounds: { ne: Coords; sw: Coords }
}
