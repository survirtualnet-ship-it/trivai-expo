import { memo } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Marker } from 'react-native-maps'
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { mapTheme } from '../theme'
import type { MapPlace } from '../store/useMapStore'
import { placeLatitude, placeLongitude } from '../utils/placeHelpers'

type Props = {
  place: MapPlace
  selected: boolean
  onPress: (id: string) => void
}

function markerColors(place: MapPlace, selected: boolean) {
  if (place.type === 'event') {
    return { fill: mapTheme.event, ring: selected ? '#fff' : mapTheme.event }
  }
  if (place.isTrending) {
    return { fill: mapTheme.trending, ring: selected ? '#fff' : mapTheme.trending }
  }
  if (place.isRecommended) {
    return { fill: mapTheme.recommended, ring: selected ? '#fff' : mapTheme.recommended }
  }
  return { fill: mapTheme.pinDefault, ring: selected ? mapTheme.accent : '#fff' }
}

const AnimatedView = Animated.createAnimatedComponent(View)

export const MapMarker = memo(function MapMarker({ place, selected, onPress }: Props) {
  const colors = markerColors(place, selected)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.22 : 1, { damping: 14, stiffness: 220 }) }],
  }), [selected])

  return (
    <Marker
      coordinate={{ latitude: placeLatitude(place), longitude: placeLongitude(place) }}
      zIndex={selected ? 999 : place.isTrending ? 50 : 1}
      onPress={() => onPress(place.id)}
      tracksViewChanges={Platform.OS === 'android'}
    >
      <AnimatedView style={[styles.wrap, animatedStyle]}>
        {place.isTrending && (
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeEmoji}>🔥</Animated.Text>
          </View>
        )}
        {place.isRecommended && !place.isTrending && (
          <View style={[styles.badge, styles.starBadge]}>
            <Animated.Text style={styles.badgeEmoji}>★</Animated.Text>
          </View>
        )}
        <View style={[styles.pinHead, { backgroundColor: colors.fill, borderColor: colors.ring }]}>
          {place.type === 'event' && <View style={styles.eventDot} />}
        </View>
        <View style={[styles.pinTail, { borderTopColor: colors.fill }]} />
      </AnimatedView>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 44,
    height: 52,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: mapTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: mapTheme.border,
  },
  starBadge: {
    backgroundColor: 'rgba(245,197,66,0.2)',
  },
  badgeEmoji: {
    fontSize: 11,
  },
  pinHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pinTail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
})
