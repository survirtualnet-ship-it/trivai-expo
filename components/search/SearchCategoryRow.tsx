import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { HighlightedText } from '@/components/search/HighlightedText'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { SearchCategory } from '@/lib/search'

type Props = {
  category: SearchCategory
  query: string
  onPress: (category: SearchCategory) => void
}

export const SearchCategoryRow = memo(function SearchCategoryRow({
  category,
  query,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(category)}
      accessibilityRole="button"
      accessibilityLabel={category.label}
    >
      <View style={[styles.icon, { backgroundColor: `${category.color}18` }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.type}>Categoría</Text>
        <HighlightedText
          text={category.label}
          query={query}
          style={styles.label}
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  body: {
    flex: 1,
    gap: 1,
  },
  type: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
  label: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
  },
})
