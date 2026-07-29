import { useCallback, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { List, LayoutGrid } from 'lucide-react-native'
import { useFavorites } from '@/hooks/useFavorites'
import { FavoritesEmptyState } from '@/components/favorites/FavoritesEmptyState'
import {
  FavoritePlaceRow,
  FavoritePlaceTile,
} from '@/components/favorites/FavoritePlaceRow'
import { deferredPush } from '@/lib/deferredNav'
import { colors, spacing, typography, radius } from '@/lib/theme'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { Dimensions } from 'react-native'

const TILE_W = (Dimensions.get('window').width - spacing.lg * 2 - spacing.md) / 2

export default function SavedScreen() {
  const {
    places,
    total,
    isLoading,
    isAuthenticated,
    refetch,
  } = useFavorites()

  const [layout, setLayout] = useState<'list' | 'grid'>('list')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try { await refetch() } finally { setRefreshing(false) }
  }, [refetch])

  const openPlace = useCallback((id: string) => {
    deferredPush(`/lugares/${id}`)
  }, [])

  const showEmpty = !isLoading && (total === 0 || !isAuthenticated)

  const renderListItem = useCallback(({ item }: { item: PlaceCardData }) => (
    <FavoritePlaceRow place={item} onPress={() => openPlace(item.id)} />
  ), [openPlace])

  const renderGridItem = useCallback(({ item }: { item: PlaceCardData }) => (
    <View style={styles.gridItem}>
      <FavoritePlaceTile
        place={item}
        width={TILE_W}
        onPress={() => openPlace(item.id)}
      />
    </View>
  ), [openPlace])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Saved</Text>
          {!showEmpty && !isLoading && (
            <Text style={styles.subtitle}>
              {total} place{total !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {!showEmpty && !isLoading && (
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setLayout('list')}
              style={[styles.toggleBtn, layout === 'list' && styles.toggleActive]}
            >
              <List size={16} color={layout === 'list' ? colors.text : colors.textTertiary} />
            </Pressable>
            <Pressable
              onPress={() => setLayout('grid')}
              style={[styles.toggleBtn, layout === 'grid' && styles.toggleActive]}
            >
              <LayoutGrid size={16} color={layout === 'grid' ? colors.text : colors.textTertiary} />
            </Pressable>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      ) : showEmpty ? (
        <FavoritesEmptyState isAuthenticated={isAuthenticated} />
      ) : (
        <FlatList
          key={layout}
          data={places}
          keyExtractor={item => item.id}
          renderItem={layout === 'grid' ? renderGridItem : renderListItem}
          numColumns={layout === 'grid' ? 2 : 1}
          columnWrapperStyle={layout === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textSecondary}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  screenTitle: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    padding: 2,
  },
  toggleBtn: {
    width: 34,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingBottom: spacing.xxxl,
  },
  gridRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
})
