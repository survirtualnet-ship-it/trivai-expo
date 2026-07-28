import { memo } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  tags: string[]
}

export const PlaceTags = memo(function PlaceTags({ tags }: Props) {
  if (!tags.length) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Highlights</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {tags.map(tag => (
          <View key={tag} style={styles.chip}>
            <Text style={styles.chipText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: S.lg,
    paddingLeft: S.lg,
    backgroundColor: T.surface,
    marginTop: S.sm,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    marginBottom: S.sm,
  },
  row: {
    gap: S.sm,
    paddingRight: S.lg,
  },
  chip: {
    paddingHorizontal: S.md,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: 'rgba(108, 76, 241, 0.15)',
  },
  chipText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.purpleInk,
  },
})
