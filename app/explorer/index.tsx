import { useCallback, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ExplorerSearchBar } from '@/components/explorer/SearchBar'
import { ExplorerCategoryChips } from '@/components/explorer/CategoryChips'
import { ExplorerBottomSheetList } from '@/components/explorer/BottomSheetList'
import { ExplorerPlaceCard } from '@/components/explorer/ExplorerPlaceCard'
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
        text: loc.id === 'near_me' ? '📍 Cerca de mí' : loc.label,
        onPress: () => {
          setLocationId(loc.id)
          setSearchAreaVisible(false)
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ])
  }, [])

  const previewPlaces = visiblePlaces.slice(0, 6)

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

      <View style={[styles.topOverlay, { paddingTop: insets.top + S.sm }]}>
        <ExplorerSearchBar
          value={search}
          onChangeText={setSearch}
          locationLabel={locationLabel}
          onLocationPress={cycleLocation}
          onFilterPress={() => router.push('/discover')}
        />
        <ExplorerCategoryChips selected={chipId} onSelect={setChipId} />
      </View>

      {searchAreaVisible && (
        <TouchableOpacity
          style={[styles.searchAreaBtn, { top: insets.top + 120 }]}
          onPress={() => setSearchAreaVisible(false)}
          activeOpacity={0.9}
        >
          <Text style={styles.searchAreaText}>Buscar en esta zona</Text>
        </TouchableOpacity>
      )}

      {previewPlaces.length > 0 && (
        <View style={styles.previewStrip} pointerEvents="box-none">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.previewContent}
          >
            {previewPlaces.map(p => (
              <ExplorerPlaceCard
                key={p.id}
                place={p}
                focused={p.id === selectedId}
                onPress={() => {
                  handleSelect(p.id)
                  handleOpenDetail(p.id)
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <ExplorerBottomSheetList
        places={visiblePlaces}
        selectedId={selectedId}
        loading={loading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
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
    backgroundColor: T.bg,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    gap: S.sm,
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
    ...SHADOW.md,
  },
  searchAreaText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
  },
  previewStrip: {
    position: 'absolute',
    bottom: '52%',
    left: 0,
    right: 0,
    zIndex: 5,
  },
  previewContent: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
})
