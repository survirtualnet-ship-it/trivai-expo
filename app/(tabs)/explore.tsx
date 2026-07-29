import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { ExploreHeader } from '@/components/ExploreHeader'
import { CategoryFilter } from '@/components/CategoryFilter'
import { PlaceCard } from '@/components/PlaceCard'
import { MapPreviewCard } from '@/components/MapPreviewCard'
import { ExploreMap } from '@/components/ExploreMap'
import { fetchExplorePlaces } from '@/lib/explore/fetchPlaces'
import type { ExploreCategoryId, ExplorePlace, ExploreViewMode } from '@/lib/explore/types'
import { getCurrentCoords } from '@/lib/geolocation'
import { deferredPush } from '@/lib/deferredNav'
import { discoverKeys, STALE } from '@/lib/queries/keys'
import { FONT } from '@/lib/typography'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function ExploreScreen() {
  const [viewMode, setViewMode] = useState<ExploreViewMode>('list')
  const [selectedCategory, setSelectedCategory] = useState<ExploreCategoryId>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 180)
    return () => clearTimeout(t)
  }, [search])

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

  const placesQuery = useQuery({
    queryKey: ['explore', 'places', selectedCategory, debouncedSearch],
    queryFn: () => fetchExplorePlaces(selectedCategory, debouncedSearch),
    staleTime: 60_000,
  })

  const places = placesQuery.data ?? []
  const selectedPlace = useMemo(
    () => places.find(p => p.id === selectedPlaceId) ?? null,
    [places, selectedPlaceId],
  )

  const userCoords = coordsQuery.data
    ? { latitude: coordsQuery.data.lat, longitude: coordsQuery.data.lng }
    : null

  const switchMode = useCallback((mode: ExploreViewMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setViewMode(mode)
    if (mode === 'list') setSelectedPlaceId(null)
  }, [])

  const openDetails = useCallback((place: ExplorePlace) => {
    deferredPush({ pathname: '/buscar', params: { q: place.name } })
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const renderItem = useCallback(({ item }: { item: ExplorePlace }) => (
    <PlaceCard
      place={item}
      saved={savedIds.has(item.id)}
      onPress={() => openDetails(item)}
      onToggleSave={() => toggleSave(item.id)}
    />
  ), [savedIds, openDetails, toggleSave])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ExploreHeader
        locationLabel="📍 Santa Cruz, Bolivia"
        weatherLabel="☀️ 28°C"
        search={search}
        onSearchChange={setSearch}
      />

      <View style={styles.toggleWrap}>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => switchMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </Pressable>
          <Pressable
            onPress={() => switchMode('map')}
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'map' }}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              Map
            </Text>
          </Pressable>
        </View>
      </View>

      <CategoryFilter
        selected={selectedCategory}
        onSelect={(id) => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setSelectedCategory(id)
          setSelectedPlaceId(null)
        }}
      />

      {viewMode === 'list' ? (
        placesQuery.isLoading && places.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator color="#666" />
          </View>
        ) : (
          <FlatList
            data={places}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyTitle}>No places found</Text>
                <Text style={styles.emptySub}>Try another category or search</Text>
              </View>
            }
          />
        )
      ) : (
        <View style={styles.mapWrap}>
          <ExploreMap
            places={places}
            selectedId={selectedPlaceId}
            userCoords={userCoords}
            onMarkerPress={setSelectedPlaceId}
          />

          {selectedPlace ? (
            <View style={styles.previewWrap} pointerEvents="box-none">
              <MapPreviewCard
                place={selectedPlace}
                onViewDetails={() => openDetails(selectedPlace)}
                onDismiss={() => setSelectedPlaceId(null)}
              />
            </View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  toggleWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  toggleText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#111',
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#E8E8ED',
  },
  previewWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 17,
    color: '#111',
  },
  emptySub: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: '#666',
  },
})
