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
import { LinearGradient } from 'expo-linear-gradient'
import { Star } from 'lucide-react-native'
import { H, homeShadow } from '@/lib/home/theme'
import type { HomePlace } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  places: HomePlace[]
  onPressPlace: (place: HomePlace) => void
}

export const RecommendedList = memo(function RecommendedList({
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
        accessibilityLabel={`${item.name}, ${item.category}`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.gradient}
        />
        <View style={styles.overlay}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.row}>
            <Star size={13} color="#FFD60A" fill="#FFD60A" />
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
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={styles.stack}
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: H.sectionGap,
    paddingHorizontal: H.padX,
    gap: 14,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 20,
    fontWeight: '600',
    color: H.text,
    letterSpacing: -0.3,
  },
  listRoot: {
    flexGrow: 0,
  },
  stack: {
    gap: 14,
  },
  card: {
    height: 200,
    borderRadius: H.radiusLg,
    overflow: 'hidden',
    backgroundColor: H.searchBg,
    ...homeShadow.card,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 4,
  },
  category: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontFamily: FONT.medium,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  distance: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
})
