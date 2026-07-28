import { memo, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MapPin, Navigation } from 'lucide-react-native'
import { MapEmbed } from '@/components/MapEmbed'
import { buildExplorerMapHtml } from '@/lib/explorerMapHtml'
import type { ExplorerMapMarker } from '@/lib/explorerMapHtml'
import type { PlaceDetail } from '@/lib/placeDetail'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
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
      <View style={styles.addressRow}>
        <MapPin size={16} color={T.primary} />
        <Text style={styles.address} numberOfLines={2}>{place.address}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onOpenMaps} activeOpacity={0.9}>
        <Navigation size={16} color="#fff" />
        <Text style={styles.btnText}>Abrir en mapas</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginTop: S.sm,
    padding: S.lg,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    marginBottom: S.md,
  },
  mapWrap: {
    height: 160,
    borderRadius: R.xl,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.sm,
    marginTop: S.md,
  },
  address: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg2,
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    marginTop: S.md,
    backgroundColor: T.primary,
    paddingVertical: S.md,
    borderRadius: R.lg,
    ...SHADOW.sm,
  },
  btnText: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: '#fff',
  },
})
