import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { ComponentType } from 'react'
import { MapPin, Star } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { T, F, S, R, SHADOW, getCatLabel } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { calcIsOpen } from '@/lib/hours'

export type PlaceCardData = {
  id: string
  name: string
  category: string
  address?: string | null
  rating_avg?: number
  is_open?: boolean
  hours?: Record<string, string> | null
  latitude?: number | null
  longitude?: number | null
  _dist?: number
}

type Props = {
  place: PlaceCardData
  onPress: () => void
  showHeart?: boolean
}

function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function PlaceCard({ place, onPress, showHeart = true }: Props) {
  const isOpen = calcIsOpen(place.hours, place.is_open ?? false)
  const dist = place._dist != null ? formatDist(place._dist) : null

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <CatCover category={place.category} variant="thumb" style={styles.cover} />
      <View style={styles.body}>
        <Text style={styles.cat}>{getCatLabel(place.category)}</Text>
        <Text style={styles.title} numberOfLines={2}>{place.name}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.status, { color: isOpen ? T.secondary : T.fg3 }]}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Text>
          {place.rating_avg ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Star size={11} color={T.accent} fill={T.accent} />
              <Text style={styles.rating}>{place.rating_avg.toFixed(1)}</Text>
            </>
          ) : null}
        </View>
        {(dist || place.address) && (
          <View style={styles.locRow}>
            <MapPin size={12} color={T.fg3} />
            <Text style={styles.loc} numberOfLines={1}>
              {dist ? `a ${dist}` : place.address}
            </Text>
          </View>
        )}
      </View>
      {showHeart && (
        <View style={styles.heart}>
          <HeartButton size={18} placeId={place.id} />
        </View>
      )}
    </TouchableOpacity>
  )
}

/** Card compacta horizontal para carruseles de zonas/categorías */
export function ZoneCard({
  nombre, emoji, bg, fg, onPress,
}: { nombre: string; emoji: string; bg: string; fg: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.zone, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.zoneEmoji}>{emoji}</Text>
      <Text style={[styles.zoneName, { color: fg }]}>{nombre}</Text>
    </TouchableOpacity>
  )
}

/** Chip de categoría con icono */
export function CategoryChip({
  label, Icon, color, bg, onPress,
}: {
  label: string
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>
  color: string
  bg: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity style={[styles.chip, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
      <Icon size={14} color={color} strokeWidth={2} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.md,
    ...SHADOW.sm,
  },
  cover: { width: 72, height: 72, borderRadius: R.lg, overflow: 'hidden' },
  body: { flex: 1, minWidth: 0, gap: 2 },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  status: { fontFamily: FONT.semibold, fontSize: F.size.xs, fontWeight: F.weight.semibold },
  dot: { color: T.fg4, fontSize: F.size.xs },
  rating: { fontFamily: FONT.semibold, fontSize: F.size.xs, color: T.fg2 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  loc: { fontFamily: FONT.regular, fontSize: F.size.xs, color: T.fg3, flex: 1 },
  heart: { alignSelf: 'flex-start', paddingTop: 2 },
  zone: {
    width: 128,
    height: 96,
    borderRadius: R.xl,
    padding: S.md,
    justifyContent: 'flex-end',
    ...SHADOW.sm,
  },
  zoneEmoji: { fontSize: 22, position: 'absolute', top: 10, right: 10 },
  zoneName: { fontFamily: FONT.bold, fontSize: F.size.md, fontWeight: F.weight.bold },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
  },
  chipText: { fontFamily: FONT.semibold, fontSize: F.size.sm, fontWeight: F.weight.semibold },
})

export const ZONE_CARD_W = 128
