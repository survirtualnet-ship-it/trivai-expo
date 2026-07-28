import { memo } from 'react'
import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { HighlightedText } from '@/components/search/HighlightedText'
import { firstPhoto } from '@/lib/discoverCardUtils'
import { getCatLabel } from '@/lib/tokens'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { ExplorerPlace } from '@/lib/explorerRanking'

type Props = {
  place: ExplorerPlace
  query: string
  onPress: () => void
}

export const SearchPlaceRow = memo(function SearchPlaceRow({
  place,
  query,
  onPress,
}: Props) {
  const photo = firstPhoto(place.photos)
  const subtitle = [
    getCatLabel(place.category),
    place.rating_avg ? place.rating_avg.toFixed(1) : null,
  ].filter(Boolean).join(' · ')

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
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
        <HighlightedText
          text={place.name}
          query={query}
          style={styles.title}
          numberOfLines={1}
        />
        <HighlightedText
          text={subtitle}
          query={query}
          style={styles.subtitle}
          numberOfLines={1}
        />
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: 10,
    paddingHorizontal: S.lg,
  },
  pressed: {
    backgroundColor: T.muted,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    overflow: 'hidden',
    backgroundColor: T.muted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})
