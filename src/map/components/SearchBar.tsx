import { memo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { mapTheme } from '../theme'
import { useMapStore } from '../store/useMapStore'
import { useSearchSuggestions } from '../hooks/useVisiblePlaces'
import { SEARCH_SUGGESTIONS } from '../data/mockPlaces'

export const SearchBar = memo(function SearchBar() {
  const searchQuery = useMapStore(s => s.searchQuery)
  const setSearchQuery = useMapStore(s => s.setSearchQuery)
  const [focused, setFocused] = useState(false)
  const dynamicSuggestions = useSearchSuggestions()

  const suggestions =
    dynamicSuggestions.length > 0
      ? dynamicSuggestions
      : searchQuery.length < 2
        ? []
        : SEARCH_SUGGESTIONS.filter(s =>
            s.toLowerCase().includes(searchQuery.toLowerCase()),
          ).slice(0, 4)

  const showSuggestions = focused && suggestions.length > 0

  return (
    <View style={styles.wrap}>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Text style={styles.icon}>⌕</Text>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tengo algo en mente..."
          placeholderTextColor={mapTheme.textMuted}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map(item => (
            <Pressable
              key={item}
              style={styles.suggestionRow}
              onPress={() => {
                setSearchQuery(item)
                setFocused(false)
              }}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    zIndex: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: mapTheme.surface,
    borderRadius: mapTheme.radius.lg,
    borderWidth: 1,
    borderColor: mapTheme.border,
    paddingHorizontal: mapTheme.spacing.lg,
    minHeight: 52,
    shadowColor: mapTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  inputWrapFocused: {
    borderColor: mapTheme.accent,
  },
  icon: {
    color: mapTheme.textSecondary,
    fontSize: 18,
    marginRight: mapTheme.spacing.sm,
  },
  input: {
    flex: 1,
    color: mapTheme.text,
    fontSize: 15,
    paddingVertical: 12,
  },
  clear: {
    color: mapTheme.textMuted,
    fontSize: 14,
    paddingLeft: mapTheme.spacing.sm,
  },
  suggestions: {
    marginTop: mapTheme.spacing.sm,
    backgroundColor: mapTheme.surfaceElevated,
    borderRadius: mapTheme.radius.md,
    borderWidth: 1,
    borderColor: mapTheme.border,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: mapTheme.spacing.lg,
    paddingVertical: mapTheme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mapTheme.border,
  },
  suggestionText: {
    color: mapTheme.text,
    fontSize: 14,
  },
})
