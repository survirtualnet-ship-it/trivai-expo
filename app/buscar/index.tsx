import { useCallback, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Keyboard,
  Text,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { SearchInput } from '@/components/search/SearchInput'
import { SearchSuggestions } from '@/components/search/SearchSuggestions'
import { SearchResults } from '@/components/search/SearchResults'
import { useSearchScreen } from '@/hooks/useSearchScreen'
import { deferredPush } from '@/lib/deferredNav'
import { logPlaceView } from '@/lib/userActivity'
import { removeRecentSearch } from '@/lib/search'
import { searchKeys } from '@/lib/queries/keys'
import type { ExplorerPlace } from '@/lib/explorerRanking'
import type { SearchCategory } from '@/lib/search'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null)
  const queryClient = useQueryClient()
  const {
    query,
    setQuery,
    debounced,
    isSearching,
    isLoading,
    isError,
    refetch,
    places,
    categories,
    popularSearches,
    recentSearches,
    recordSearch,
    selectSuggestion,
    userId,
  } = useSearchScreen()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    Keyboard.dismiss()
    router.back()
  }, [])

  const openPlace = useCallback((place: ExplorerPlace) => {
    const term = debounced || query.trim()
    if (term) recordSearch(term)
    if (userId) logPlaceView(userId, place.id)
    Keyboard.dismiss()
    deferredPush(`/lugares/${place.id}`)
  }, [debounced, query, recordSearch, userId])

  const openCategory = useCallback((category: SearchCategory) => {
    recordSearch(category.label)
    Keyboard.dismiss()
    if (category.href) {
      deferredPush(category.href as '/mapa')
    } else {
      setQuery(category.label)
    }
  }, [recordSearch, setQuery])

  const handleSuggestion = useCallback((term: string) => {
    selectSuggestion(term)
    inputRef.current?.focus()
  }, [selectSuggestion])

  const handleRemoveRecent = useCallback(async (term: string) => {
    const next = await removeRecentSearch(term)
    queryClient.setQueryData(searchKeys.recent(), next)
  }, [queryClient])

  const handleSubmit = useCallback(() => {
    const term = query.trim()
    if (term) recordSearch(term)
    Keyboard.dismiss()
  }, [query, recordSearch])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.inputCol}>
          <SearchInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            autoFocus
            onSubmit={handleSubmit}
          />
        </View>
        <Pressable
          onPress={dismiss}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.cancelPressed}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          <Text style={styles.cancel}>Cancelar</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {!isSearching ? (
          <SearchSuggestions
            popular={popularSearches}
            recent={recentSearches}
            onSelect={handleSuggestion}
            onRemoveRecent={handleRemoveRecent}
          />
        ) : (
          <SearchResults
            query={query.trim() || debounced}
            places={places}
            categories={categories}
            loading={isLoading}
            error={isError}
            onRetry={() => refetch()}
            onPlacePress={openPlace}
            onCategoryPress={openCategory}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.surface,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.md,
  },
  inputCol: {
    flex: 1,
  },
  cancel: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.primary,
  },
  cancelPressed: {
    opacity: 0.55,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
})
