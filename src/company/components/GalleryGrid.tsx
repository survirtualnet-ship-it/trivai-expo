import { memo } from 'react'
import { Dimensions, Image, StyleSheet, View } from 'react-native'
import { companyTheme as t } from '../theme'

const COLS = 3
const GAP = t.spacing.sm
const SIZE =
  (Dimensions.get('window').width - t.spacing.lg * 2 - GAP * (COLS - 1)) / COLS

type Props = {
  images: string[]
}

export const GalleryGrid = memo(function GalleryGrid({ images }: Props) {
  return (
    <View style={styles.grid}>
      {images.map((uri, index) => (
        <Image key={`${uri}-${index}`} source={{ uri }} style={styles.tile} />
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    width: SIZE,
    height: SIZE,
    borderRadius: t.radius.md,
    backgroundColor: t.surfaceMuted,
  },
})
