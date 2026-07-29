import { memo, useCallback } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { Star } from 'lucide-react-native'
import { H, homeShadow } from '@/lib/home/theme'
import type { HomePlace } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  places: HomePlace[]
  onPressPlace: (place: HomePlace) => void
}

const CARD_W = 220
const CARD_H = 140

export const PlaceHorizontalList = memo(function PlaceHorizontalList({
  title,
  places,
  onPressPlace,
}: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HomePlace>) => (
      <Pressable
        onPress={() => onPressPlace(item)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.rating} stars, ${item.distance}`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.scrim} />
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.row}>
            <Star size={12} color="#FFD60A" fill="#FFD60A" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
      </Pressable>
    ),
    [onPressPlace],
  )

  if (places.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        snapToInterval={CARD_W + 12}
        snapToAlignment="start"
        disableIntervalMomentum
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: H.sectionGap,
    gap: 14,
  },
  title: {
    paddingHorizontal: H.padX,
    fontFamily: FONT.semibold,
    fontSize: 20,
    fontWeight: '600',
    color: H.text,
    letterSpacing: -0.3,
  },
  listRoot: {
    flexGrow: 0,
  },
  list: {
    paddingHorizontal: H.padX,
    gap: 12,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: H.radius,
    overflow: 'hidden',
    backgroundColor: H.searchBg,
    ...homeShadow.card,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  meta: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 4,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  distance: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
})
