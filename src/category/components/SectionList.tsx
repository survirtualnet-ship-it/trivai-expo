import { memo, useCallback } from 'react'
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { PlaceCard } from './PlaceCard'
import { categoryTheme } from '../theme'
import type { CategoryPlace } from '../data/mockCategoryData'

type Props = {
  title: string
  places: CategoryPlace[]
  onPressPlace?: (place: CategoryPlace) => void
  index?: number
}

export const SectionList = memo(function SectionList({
  title,
  places,
  onPressPlace,
  index = 0,
}: Props) {
  const renderItem: ListRenderItem<CategoryPlace> = useCallback(
    ({ item }) => (
      <PlaceCard place={item} onPress={() => onPressPlace?.(item)} />
    ),
    [onPressPlace],
  )

  if (places.length === 0) return null

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(18)}
      style={styles.section}
    >
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
      />
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: categoryTheme.spacing.xxl,
  },
  title: {
    color: categoryTheme.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    paddingHorizontal: categoryTheme.spacing.lg,
    marginBottom: categoryTheme.spacing.md,
  },
  list: {
    paddingHorizontal: categoryTheme.spacing.lg,
  },
})
