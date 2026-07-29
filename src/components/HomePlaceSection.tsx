import { memo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { PlaceCard } from './PlaceCard'
import { SectionHeader } from './SectionHeader'
import { spacing } from '../theme'
import type { PlaceItem } from '../data/mock'

type Props = {
  title: string
  places: PlaceItem[]
  onPressPlace?: (place: PlaceItem) => void
}

export const HomePlaceSection = memo(function HomePlaceSection({
  title,
  places,
  onPressPlace,
}: Props) {
  if (places.length === 0) return null

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        style={styles.scroll}
        decelerationRate="fast"
        nestedScrollEnabled
      >
        {places.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            onPress={onPressPlace ? () => onPressPlace(place) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxl,
  },
  scroll: {
    flexGrow: 0,
    overflow: 'visible',
    minHeight: 180,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
})
