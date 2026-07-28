import { memo, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { Star } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { Skeleton } from '@/components/ui/Skeleton'
import { FadeInView } from '@/components/ui/FadeInView'
import { firstPhoto } from '@/lib/discoverCardUtils'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { getCatLabel } from '@/lib/tokens'
import { deferredPush } from '@/lib/deferredNav'

const CARD_W = 168

type Props = {
  places: PlaceCardData[]
  loading?: boolean
}

export const SimilarPlaces = memo(function SimilarPlaces({ places, loading }: Props) {
  const renderItem = useCallback(({ item, index }: { item: PlaceCardData; index: number }) => {
    const photo = firstPhoto(item.photos)
    return (
      <FadeInView delay={index * 40}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => deferredPush(`/place/${item.id}`)}
          activeOpacity={0.92}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <CatCover category={item.category} variant="banner" style={styles.image} />
          )}
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cat}>{getCatLabel(item.category)}</Text>
            {(item.rating_avg ?? 0) > 0 && (
              <View style={styles.rating}>
                <Star size={11} color={T.accent} fill={T.accent} />
                <Text style={styles.ratingText}>{item.rating_avg?.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </FadeInView>
    )
  }, [])

  if (loading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>También te puede gustar</Text>
        <View style={styles.skeletonRow}>
          <Skeleton height={200} width={CARD_W} style={styles.sk} />
          <Skeleton height={200} width={CARD_W} style={styles.sk} />
        </View>
      </View>
    )
  }

  if (!places.length) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>También te puede gustar</Text>
      <FlatList
        horizontal
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginTop: S.sm,
    paddingTop: S.lg,
    paddingBottom: S.xxxl,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    paddingHorizontal: S.lg,
    marginBottom: S.md,
  },
  list: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  card: {
    width: CARD_W,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.bg,
    ...SHADOW.sm,
  },
  image: {
    width: CARD_W,
    height: 112,
  },
  body: {
    padding: S.sm,
    gap: 2,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.fg1,
  },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg2,
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
