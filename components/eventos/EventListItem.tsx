import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { T, F, S, R, getCatColor, getCatLabel } from '@/lib/tokens'

export type ListEvent = {
  id: string
  name: string
  category: string
  start_datetime: string
  is_free: boolean
  attendees_count?: number
  place?: { name: string } | null
  _dist?: number
}

function formatHora(dt: string) {
  return new Date(dt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function formatDist(km: number) {
  const val = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`
  return `A ${val}`
}

type Tag = { label: string; bg: string; fg: string }

function resolveTag(ev: ListEvent): Tag | null {
  const popular = (ev.attendees_count ?? 0) >= 3
  const cat = ev.category.toLowerCase()

  if (ev.is_free) return { label: 'Gratis', bg: T.purpleSoft, fg: T.purple }
  if (popular) return { label: 'Popular', bg: T.greenSoft, fg: T.green }
  if (cat.includes('arte') || cat.includes('cultura')) return { label: 'Arte', bg: T.orangeSoft, fg: T.orange }
  return null
}

type Props = {
  event: ListEvent
  saved?: boolean
  onSaveToggle?: (active: boolean) => void
  onPress: () => void
}

export function EventListItem({ event, saved, onSaveToggle, onPress }: Props) {
  const catColor = getCatColor(event.category)
  const catLabel = getCatLabel(event.category)
  const tag = resolveTag(event)

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumb}>
        <CatCover category={event.category} variant="thumb" style={styles.thumbImg} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          <Text style={{ color: catColor, fontWeight: F.weight.semibold }}>{catLabel}</Text>
          <Text style={{ color: T.fg4 }}> · </Text>
          <Text style={{ color: T.fg3 }}>{formatHora(event.start_datetime)}</Text>
        </Text>
        {event.place?.name ? (
          <Text style={styles.loc} numberOfLines={1}>{event.place.name}</Text>
        ) : null}
        {event._dist != null && (
          <Text style={styles.dist}>{formatDist(event._dist)}</Text>
        )}
      </View>

      <View style={styles.right}>
        <HeartButton size={18} eventId={event.id} initialActive={saved} managed onToggle={onSaveToggle} />
        {tag ? (
          <View style={[styles.tag, { backgroundColor: tag.bg }]}>
            <Text style={[styles.tagText, { color: tag.fg }]}>{tag.label}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: S.md + 2,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  thumb: {
    width: 92,
    height: 92,
    borderRadius: R.lg,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: T.muted,
  },
  thumbImg: {
    height: 92,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingVertical: 2,
  },
  title: {
    fontSize: F.size.md + 1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: F.size.xs + 1,
  },
  loc: {
    fontSize: F.size.xs + 1,
    color: T.fg3,
    marginTop: 1,
  },
  dist: {
    fontSize: F.size.xs + 1,
    color: T.fg3,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    minHeight: 92,
    paddingVertical: 2,
    gap: S.sm,
  },
  tag: {
    paddingHorizontal: S.sm + 2,
    paddingVertical: 5,
    borderRadius: R.full,
  },
  tagText: {
    fontSize: 10,
    fontWeight: F.weight.bold,
    letterSpacing: 0.2,
  },
})
