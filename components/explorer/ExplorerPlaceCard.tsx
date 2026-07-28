import { memo } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native'
import { CatCover } from '@/components/CatCover'
import { RatingCompact } from '@/components/ui/Rating'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'
import { firstPhoto } from '@/lib/discoverCardUtils'
import type { ExplorerPlace } from '@/lib/explorerRanking'

type Props = {
  place: ExplorerPlace
  focused?: boolean
  onPress: () => void
}

/** Clean Apple Maps–style list row: image + name first */
export const ExplorerPlaceCard = memo(function ExplorerPlaceCard({
  place,
  focused,
  onPress,
}: Props) {
  const photo = firstPhoto(place.photos)
  const minutes = place._dist != null ? distToMinutes(place._dist) : null
  const cat = getCatLabel(place.category)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        focused && styles.rowFocused,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.thumb} />
      ) : (
        <CatCover
          category={place.category}
          variant="thumb"
          photoUri={photo}
          style={styles.thumb}
        />
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{place.name}</Text>
        <View style={styles.metaRow}>
          {(place.rating_avg ?? 0) > 0 && (
            <RatingCompact value={place.rating_avg ?? 0} size="sm" />
          )}
          <Text style={styles.meta} numberOfLines={1}>
            {cat}
            {minutes != null ? ` · ${minutes} min` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    paddingHorizontal: S.lg,
    backgroundColor: T.surface,
  },
  rowFocused: {
    backgroundColor: T.muted,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: T.muted,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: R.lg,
    overflow: 'hidden',
    backgroundColor: T.muted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  meta: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})

export const EXPLORER_CARD_WIDTH = 280
