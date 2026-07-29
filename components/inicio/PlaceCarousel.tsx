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
import { I, SP, RD, cardShadow } from '@/lib/inicio/theme'
import type { InicioPlace } from '@/lib/inicio/mockData'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  places: InicioPlace[]
  onPressPlace: (place: InicioPlace) => void
}

const CARD_W = 200

export const PlaceCarousel = memo(function PlaceCarousel({
  title,
  places,
  onPressPlace,
}: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<InicioPlace>) => (
      <Pressable
        onPress={() => onPressPlace(item)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={item.name}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.category} numberOfLines={1}>
            {item.category}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>
      </Pressable>
    ),
    [onPressPlace],
  )

  if (places.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      <FlatList
        horizontal
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: SP.xxl,
    gap: SP.lg,
  },
  heading: {
    paddingHorizontal: SP.lg,
    fontFamily: FONT.semibold,
    fontSize: 20,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.3,
  },
  listRoot: {
    flexGrow: 0,
  },
  list: {
    paddingHorizontal: SP.lg,
    gap: SP.md,
  },
  card: {
    width: CARD_W,
    borderRadius: RD.md,
    backgroundColor: I.card,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: I.border,
    ...cardShadow,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: I.fill,
  },
  body: {
    paddingHorizontal: SP.md,
    paddingVertical: SP.md,
    gap: SP.xs,
  },
  category: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: I.accent,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.2,
  },
  distance: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: I.textSecondary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})
