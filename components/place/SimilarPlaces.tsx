import { memo, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native'
import { CatCover } from '@/components/CatCover'
import { Skeleton } from '@/components/ui/Skeleton'
import { firstPhoto } from '@/lib/discoverCardUtils'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { deferredPush } from '@/lib/deferredNav'

const CARD_W = 156

type Props = {
  places: PlaceCardData[]
  loading?: boolean
}

export const SimilarPlaces = memo(function SimilarPlaces({ places, loading }: Props) {
  const renderItem = useCallback(({ item }: { item: PlaceCardData }) => {
    const photo = firstPhoto(item.photos)
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => deferredPush(`/lugares/${item.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${item.name}`}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} />
        ) : (
          <CatCover
            category={item.category}
            variant="banner"
            photoUri={photo}
            style={styles.image}
          />
        )}
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {(item.rating_avg ?? 0) > 0 && (
          <Text style={styles.rating}>{item.rating_avg?.toFixed(1)}</Text>
        )}
      </Pressable>
    )
  }, [])

  if (loading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Similares</Text>
        <View style={styles.skeletonRow}>
          <Skeleton height={180} width={CARD_W} style={styles.sk} />
          <Skeleton height={180} width={CARD_W} style={styles.sk} />
        </View>
      </View>
    )
  }

  if (!places.length) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Similares</Text>
      <FlatList
        horizontal
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingTop: S.sm,
    paddingBottom: S.xxxl,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
    paddingHorizontal: S.lg,
    marginBottom: S.lg,
  },
  list: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  card: {
    width: CARD_W,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: CARD_W,
    height: 120,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.muted,
    ...SHADOW.sm,
  },
  name: {
    marginTop: S.sm,
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  rating: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.lg,
  },
  sk: {
    borderRadius: R.xl,
  },
})
