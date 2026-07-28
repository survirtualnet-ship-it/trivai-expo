import { memo, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Clock, Search } from 'lucide-react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  popular: readonly string[]
  recent: string[]
  onSelect: (term: string) => void
  onRemoveRecent?: (term: string) => void
}

function Row({
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
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          accessibilityLabel={`Eliminar ${label}`}
        >
          <Text style={styles.remove}>Eliminar</Text>
        </Pressable>
      ) : null}
    </Pressable>
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
          <Text style={styles.sectionTitle}>Recientes</Text>
          {recent.map(term => (
            <Row
              key={`recent-${term}`}
              icon={<Clock size={16} color={T.fg3} strokeWidth={2} />}
              label={term}
              onPress={() => onSelect(term)}
              onRemove={onRemoveRecent ? () => onRemoveRecent(term) : undefined}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sugerencias</Text>
        {popular.map(term => (
          <Row
            key={`popular-${term}`}
            icon={<Search size={16} color={T.fg3} strokeWidth={2} />}
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
    marginBottom: S.xxl,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg3,
    marginBottom: S.sm,
    paddingHorizontal: S.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: 12,
    paddingHorizontal: S.lg,
  },
  pressed: {
    backgroundColor: T.muted,
  },
  icon: {
    width: 28,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  remove: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})
