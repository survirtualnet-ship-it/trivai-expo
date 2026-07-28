import { useCallback, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  Pressable,
  Text,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExplorerSearchBar } from '@/components/explorer/SearchBar'
import { ExplorerBottomSheetList } from '@/components/explorer/BottomSheetList'
import { MapViewExplorer } from '@/components/map/MapView'
import type { MapRegion } from '@/components/map/MapView.native'
import { toExplorerMarkers } from '@/lib/explorerMapHtml'
import { useExplorerCoords, useExplorerPlaces } from '@/hooks/useExplorerPlaces'
import {
  EXPLORER_LOCATIONS,
  type ExplorerChipId,
  type ExplorerLocationId,
} from '@/lib/explorerCategories'
import { filterPlacesInBounds } from '@/lib/explorerRanking'
import { deferredPush } from '@/lib/deferredNav'
import { logPlaceView } from '@/lib/userActivity'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function ExplorerScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useUser()

  const [chipId, setChipId] = useState<ExplorerChipId>('all')
  const [search, setSearch] = useState('')
  const [locationId, setLocationId] = useState<ExplorerLocationId>('near_me')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapRegion, setMapRegion] = useState<MapRegion | null>(null)
  const [searchAreaVisible, setSearchAreaVisible] = useState(false)

  const coordsQuery = useExplorerCoords()
  const userCoords = coordsQuery.data ?? null

  const {
    places,
    origin,
    loading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useExplorerPlaces({
    chipId,
    search,
    locationId,
    userCoords,
  })

  const visiblePlaces = useMemo(() => {
    if (!mapRegion || !searchAreaVisible) return places
    return filterPlacesInBounds(places, mapRegion.bounds)
  }, [places, mapRegion, searchAreaVisible])

  const markers = useMemo(
    () => toExplorerMarkers(visiblePlaces),
    [visiblePlaces],
  )

  const locationLabel = useMemo(() => {
    if (locationId === 'near_me' && userCoords) return 'Cerca de mí'
    return EXPLORER_LOCATIONS.find(l => l.id === locationId)?.label ?? 'Santa Cruz'
  }, [locationId, userCoords])

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleOpenDetail = useCallback((id: string) => {
    if (user?.id) logPlaceView(user.id, id)
    deferredPush(`/lugares/${id}`)
  }, [user?.id])

  const handleMarkerPress = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleRegionChange = useCallback((region: MapRegion) => {
    setMapRegion(region)
    setSearchAreaVisible(true)
  }, [])

  const cycleLocation = useCallback(() => {
    Alert.alert('Ubicación', undefined, [
      ...EXPLORER_LOCATIONS.map(loc => ({
        text: loc.id === 'near_me' ? 'Cerca de mí' : loc.label,
        onPress: () => {
          setLocationId(loc.id)
          setSearchAreaVisible(false)
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ])
  }, [])

  return (
    <View style={styles.root}>
      <MapViewExplorer
        markers={markers}
        center={origin}
        selectedId={selectedId}
        userLocation={userCoords}
        onMarkerPress={handleMarkerPress}
        onRegionChange={handleRegionChange}
      />

      <View
        style={[styles.topOverlay, { paddingTop: insets.top + S.sm }]}
        pointerEvents="box-none"
      >
        <ExplorerSearchBar
          value={search}
          onChangeText={setSearch}
          locationLabel={locationLabel}
          onLocationPress={cycleLocation}
        />
      </View>

      {isError && (
        <View style={[styles.errorBanner, { top: insets.top + 108 }]} accessibilityRole="alert">
          <Text style={styles.errorText}>No pudimos cargar lugares</Text>
          <Pressable onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Reintentar">
            <Text style={styles.errorRetry}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {searchAreaVisible && (
        <Pressable
          style={({ pressed }) => [
            styles.searchAreaBtn,
            { top: insets.top + 108 },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => setSearchAreaVisible(false)}
        >
          <Text style={styles.searchAreaText}>Buscar en esta zona</Text>
        </Pressable>
      )}

      <ExplorerBottomSheetList
        places={visiblePlaces}
        selectedId={selectedId}
        loading={loading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        chipId={chipId}
        onChipSelect={setChipId}
        onSelect={handleSelect}
        onOpenDetail={handleOpenDetail}
        onEndReached={() => fetchNextPage()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.muted,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchAreaBtn: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: T.surface,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
    zIndex: 11,
    ...SHADOW.sm,
  },
  searchAreaText: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg1,
  },
  errorBanner: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
    zIndex: 12,
    ...SHADOW.sm,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg2,
  },
  errorRetry: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
  },
})
