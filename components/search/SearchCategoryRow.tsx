import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { SearchCategory } from '@/lib/search'

type Props = {
  category: SearchCategory
  query: string
  onPress: (category: SearchCategory) => void
}

function highlight(label: string, query: string) {
  if (!query.trim()) return <Text style={styles.label}>{label}</Text>
  const q = query.trim().toLowerCase()
  const idx = label.toLowerCase().indexOf(q)
  if (idx === -1) return <Text style={styles.label}>{label}</Text>
  return (
    <Text style={styles.label}>
      {label.slice(0, idx)}
      <Text style={styles.highlight}>{label.slice(idx, idx + q.length)}</Text>
      {label.slice(idx + q.length)}
    </Text>
  )
}

export const SearchCategoryRow = memo(function SearchCategoryRow({
  category,
  query,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(category)}
      activeOpacity={0.85}
    >
      <View style={[styles.icon, { backgroundColor: `${category.color}22` }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.type}>Category</Text>
        {highlight(category.label, query)}
      </View>
      <ChevronRight size={18} color={T.fg4} />
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  type: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.fg3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.fg1,
  },
  highlight: {
    backgroundColor: T.purpleSoft,
    color: T.primary,
    fontFamily: FONT.bold,
  },
})
