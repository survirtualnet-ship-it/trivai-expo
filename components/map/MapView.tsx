import { Platform } from 'react-native'
import { MapViewExplorer as NativeMap } from './MapView.native'
import { MapViewExplorer as WebMap } from './MapView.web'

export const MapViewExplorer = Platform.OS === 'web' ? WebMap : NativeMap
export type { MapRegion } from './MapView.native'
