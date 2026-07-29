import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MapEmbed } from '@/components/MapEmbed'
import { buildExplorerMapHtml } from '@/lib/explorerMapHtml'
import { LIMA_REGION, NEARBY_PLACES } from '../data/mock'
import { colors, spacing, radius, fontSize, fontWeight } from '../theme'

const MARKERS = NEARBY_PLACES.map((place, index) => ({
  id: place.id,
  name: place.name,
  category: place.category,
  lat: LIMA_REGION.latitude + (index - 1.5) * 0.012,
  lng: LIMA_REGION.longitude + (index % 2 === 0 ? 0.01 : -0.012),
}))

/** Web fallback — react-native-maps is native-only. */
export function MapaScreen() {
  const html = useMemo(
    () =>
      buildExplorerMapHtml(MARKERS, {
        lat: LIMA_REGION.latitude,
        lng: LIMA_REGION.longitude,
      }),
    [],
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Lima · lugares cercanos</Text>
      </View>
      <View style={styles.mapCard}>
        <MapEmbed html={html} />
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
})
