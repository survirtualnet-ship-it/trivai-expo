import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { ComponentType } from 'react'
import { Clock, MapPin } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { T, F, S, R, SHADOW, getCatLabel } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { calcIsOpen } from '@/lib/hours'
import { getCityZone, distToMinutes } from '@/lib/zones'
import type { AppLocale } from '@/lib/i18n/discover'
import { DISCOVER_STRINGS, categoryLabel } from '@/lib/i18n/discover'

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
  locale?: AppLocale
}

export function PlaceCard({ place, onPress, showHeart = true, locale = 'es' }: Props) {
  const t = DISCOVER_STRINGS[locale]
  const isOpen = calcIsOpen(place.hours, place.is_open ?? false)
  const minutes = place._dist != null ? distToMinutes(place._dist) : null
  const zone =
    place.latitude != null && place.longitude != null
      ? getCityZone(place.latitude, place.longitude)
      : null
  const catLabel = locale === 'es' ? getCatLabel(place.category) : categoryLabel(place.category, locale)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <CatCover category={place.category} variant="thumb" style={styles.cover} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{place.name}</Text>

        {minutes != null && (
          <View style={styles.row}>
            <Clock size={12} color={T.fg3} />
            <Text style={styles.meta}>{minutes} {t.min}</Text>
          </View>
        )}

        <Text style={styles.cat}>{catLabel}</Text>

        <Text style={[styles.status, { color: isOpen ? T.secondary : T.fg3 }]}>
          {isOpen ? t.open : t.closed}
        </Text>

        {zone && (
          <View style={styles.row}>
            <MapPin size={12} color={T.fg3} />
            <Text style={styles.meta}>{t.zone} {zone}</Text>
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
  label, Icon, color, bg, onPress, active = false,
}: {
  label: string
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>
  color: string
  bg: string
  onPress: () => void
  active?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: active ? color : bg },
        active && styles.chipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon size={14} color={active ? '#fff' : color} strokeWidth={2} />
      <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>{label}</Text>
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
  body: { flex: 1, minWidth: 0, gap: 3 },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontFamily: FONT.regular, fontSize: F.size.xs, color: T.fg3 },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  status: { fontFamily: FONT.semibold, fontSize: F.size.xs, fontWeight: F.weight.semibold },
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
  chipActive: {
    ...SHADOW.sm,
  },
  chipText: { fontFamily: FONT.semibold, fontSize: F.size.sm, fontWeight: F.weight.semibold },
})

export const ZONE_CARD_W = 128
