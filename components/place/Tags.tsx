import { memo, useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Tag } from '@/components/ui/Tag'
import { S } from '@/lib/tokens'
import type { IdealForTag } from '@/lib/placeDetail'

type Props = {
  tags?: string[]
  idealFor?: IdealForTag[]
}

export const PlaceTags = memo(function PlaceTags({ tags = [], idealFor = [] }: Props) {
  const chips = useMemo(() => {
    const merged = [...idealFor, ...tags]
    return [...new Set(merged)].slice(0, 8)
  }, [tags, idealFor])

  if (!chips.length) return null

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
      >
        {chips.map(tag => (
          <Tag key={tag} label={tag} variant="secondary" size="md" />
        ))}
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    paddingTop: S.sm,
    paddingBottom: S.lg,
  },
  row: {
    paddingHorizontal: S.lg,
    gap: S.sm,
  },
})
