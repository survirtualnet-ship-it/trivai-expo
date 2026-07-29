import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LIMA_REGION, NEARBY_PLACES } from '../data/mock'
import { colors, spacing, radius, fontSize, fontWeight } from '../theme'

const MARKERS = NEARBY_PLACES.map((place, index) => ({
  ...place,
  latitude: LIMA_REGION.latitude + (index - 1.5) * 0.012,
  longitude: LIMA_REGION.longitude + (index % 2 === 0 ? 0.01 : -0.012),
}))

export function MapaScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Lima · lugares cercanos</Text>
      </View>
      <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={LIMA_REGION}
          showsUserLocation
          showsMyLocationButton
        >
          {MARKERS.map(place => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.name}
              description={place.category}
            />
          ))}
        </MapView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  mapCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})
