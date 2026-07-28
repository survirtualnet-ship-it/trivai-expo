import { memo, useMemo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { MapEmbed } from '@/components/MapEmbed'
import { buildExplorerMapHtml } from '@/lib/explorerMapHtml'
import type { ExplorerMapMarker } from '@/lib/explorerMapHtml'
import type { PlaceDetail } from '@/lib/placeDetail'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  place: PlaceDetail
  onOpenMaps: () => void
}

export const LocationPreview = memo(function LocationPreview({ place, onOpenMaps }: Props) {
  const html = useMemo(() => {
    const markers: ExplorerMapMarker[] = [{
      id: place.id,
      name: place.name,
      category: place.category,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
    }]
    return buildExplorerMapHtml(
      markers,
      place.coordinates,
      place.id,
      null,
      15,
    )
  }, [place])

  if (!place.coordinates.lat && !place.coordinates.lng) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Ubicación</Text>
      <View style={styles.mapWrap}>
        <MapEmbed html={html} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        onPress={onOpenMaps}
        accessibilityRole="button"
        accessibilityLabel="Abrir en mapas"
      >
        <Text style={styles.link}>Abrir en Mapas</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingBottom: S.xxl,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
    marginBottom: S.lg,
  },
  mapWrap: {
    height: 180,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.muted,
  },
  linkRow: {
    marginTop: S.md,
    alignSelf: 'flex-start',
  },
  link: {
    fontFamily: FONT.medium,
    fontSize: F.size.md,
    color: T.primary,
  },
})
