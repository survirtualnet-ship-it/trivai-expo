import { memo } from 'react'
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Star } from 'lucide-react-native'
import { FONT } from '@/lib/typography'
import type { ExplorePlace } from '@/lib/explore/types'

type Props = {
  place: ExplorePlace
  onViewDetails: () => void
  onDismiss?: () => void
}

/** Floating iOS-style card shown when a map marker is selected */
export const MapPreviewCard = memo(function MapPreviewCard({
  place,
  onViewDetails,
  onDismiss,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onViewDetails}
      accessibilityRole="button"
      accessibilityLabel={`View ${place.name}`}
    >
      <Image source={{ uri: place.image }} style={styles.thumb} />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <View style={styles.metaRow}>
          <Star size={12} color="#F5A623" fill="#F5A623" />
          <Text style={styles.meta}>{place.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{place.distance}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          onPress={onViewDetails}
          accessibilityRole="button"
          accessibilityLabel="View details"
        >
          <Text style={styles.btnText}>View details</Text>
        </Pressable>
      </View>

      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          style={styles.dismiss}
          accessibilityLabel="Dismiss"
        >
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>
      ) : null}
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  pressed: {
    opacity: 0.96,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#666',
  },
  dot: {
    color: '#CCC',
  },
  btn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnText: {
    fontFamily: FONT.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismiss: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 12,
    color: '#999',
  },
})
