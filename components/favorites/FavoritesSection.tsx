import { memo, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import {
  FavoritePlaceRow,
  FavoritePlaceTile,
} from '@/components/favorites/FavoritePlaceRow'
import { deferredPush } from '@/lib/deferredNav'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { FavoriteGroup } from '@/lib/favoritesGrouping'

const SCREEN_W = Dimensions.get('window').width
const GRID_GAP = S.md
const GRID_PAD = S.lg
const TILE_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2

type Props = {
  group: FavoriteGroup
  layout: 'list' | 'grid'
}

export const FavoritesSection = memo(function FavoritesSection({
  group,
  layout,
}: Props) {
  const openPlace = useCallback((id: string) => {
    deferredPush(`/lugares/${id}`)
  }, [])

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{group.title}</Text>
        <Text style={styles.count}>{group.places.length}</Text>
      </View>

      {layout === 'grid' ? (
        <View style={styles.grid}>
          {group.places.map(place => (
            <FavoritePlaceTile
              key={place.id}
              place={place}
              width={TILE_W}
              onPress={() => openPlace(place.id)}
            />
          ))}
        </View>
      ) : (
        group.places.map((place, index) => (
          <View key={place.id}>
            {index > 0 ? <View style={styles.sep} /> : null}
            <FavoritePlaceRow
              place={place}
              onPress={() => openPlace(place.id)}
            />
          </View>
        ))
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginBottom: S.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    marginBottom: S.sm,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
  },
  count: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_PAD,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
    marginLeft: S.lg + 56 + S.md,
  },
})
