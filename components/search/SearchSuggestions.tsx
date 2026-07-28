import { memo, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Clock, TrendingUp, X } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  popular: readonly string[]
  recent: string[]
  onSelect: (term: string) => void
  onRemoveRecent?: (term: string) => void
}

function SuggestionRow({
  icon,
  label,
  onPress,
  onRemove,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
  onRemove?: () => void
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.rowText} numberOfLines={1}>{label}</Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} hitSlop={10}>
          <X size={16} color={T.fg4} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  )
}

export const SearchSuggestions = memo(function SearchSuggestions({
  popular,
  recent,
  onSelect,
  onRemoveRecent,
}: Props) {
  return (
    <View style={styles.wrap}>
      {recent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent searches</Text>
          {recent.map(term => (
            <SuggestionRow
              key={`recent-${term}`}
              icon={<Clock size={18} color={T.fg3} />}
              label={term}
              onPress={() => onSelect(term)}
              onRemove={onRemoveRecent ? () => onRemoveRecent(term) : undefined}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular searches</Text>
        {popular.map(term => (
          <SuggestionRow
            key={`popular-${term}`}
            icon={<TrendingUp size={18} color={T.accent} />}
            label={term}
            onPress={() => onSelect(term)}
          />
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingTop: S.sm,
  },
  section: {
    marginBottom: S.xl,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.fg3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: S.sm,
    paddingHorizontal: S.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    paddingHorizontal: S.xs,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: R.md,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
  },
  chevron: {
    fontSize: 20,
    color: T.fg4,
    lineHeight: 22,
  },
})
