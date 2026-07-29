import { memo } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Bookmark, Star } from 'lucide-react-native'
import { FONT } from '@/lib/typography'
import type { ExplorePlace } from '@/lib/explore/types'

type Props = {
  place: ExplorePlace
  saved?: boolean
  onPress: () => void
  onToggleSave?: () => void
}

/** Explore list card — Apple-style, image + name focused */
export const PlaceCard = memo(function PlaceCard({
  place,
  saved = false,
  onPress,
  onToggleSave,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      <Image source={{ uri: place.image }} style={styles.image} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
          <Pressable
            onPress={onToggleSave}
            hitSlop={10}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Unsave place' : 'Save place'}
          >
            <Bookmark
              size={20}
              color={saved ? '#111' : '#999'}
              fill={saved ? '#111' : 'transparent'}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Star size={13} color="#F5A623" fill="#F5A623" />
          <Text style={styles.rating}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{place.distance}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta} numberOfLines={1}>{place.categoryLabel}</Text>
        </View>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F2F2F7',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  name: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: '#111',
  },
  dot: {
    color: '#CCC',
    fontSize: 13,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#666',
    flexShrink: 1,
  },
})
