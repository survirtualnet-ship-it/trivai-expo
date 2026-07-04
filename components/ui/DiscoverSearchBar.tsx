import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Search, X } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { deferredPush } from '@/lib/deferredNav'
import type { SearchSuggestion } from '@/lib/smartSearch'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  suggestions: SearchSuggestion[]
  searching?: boolean
  showSuggestions?: boolean
}

export function DiscoverSearchBar({
  value,
  onChangeText,
  placeholder,
  suggestions,
  searching = false,
  showSuggestions = false,
}: Props) {
  const active = value.trim().length > 0

  return (
    <View style={styles.wrap}>
      <View style={[styles.search, active && styles.searchActive]}>
        <Search size={18} color={active ? T.primary : T.fg3} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.fg4}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={T.primary} />}
        {active && !searching && (
          <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color={T.fg3} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && active && suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestionRow}
              onPress={() => deferredPush(item.href as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.suggestionEmoji}>{item.emoji}</Text>
              <View style={styles.suggestionBody}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.suggestionSub} numberOfLines={1}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.sm,
    zIndex: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    paddingHorizontal: S.lg,
    height: 52,
    borderWidth: 1.5,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  searchActive: {
    borderColor: T.primary,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
    paddingVertical: 0,
  },
  suggestions: {
    marginTop: S.sm,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  suggestionEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  suggestionBody: { flex: 1, minWidth: 0 },
  suggestionTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
  suggestionSub: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
    marginTop: 2,
  },
})
