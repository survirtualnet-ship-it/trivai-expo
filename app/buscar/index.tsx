import { useCallback, useEffect, useRef } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
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
import { T, S, R, SHADOW } from '@/lib/tokens'

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
    const t = setTimeout(() => inputRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  const openPlace = useCallback((place: ExplorerPlace) => {
    if (debounced) recordSearch(debounced)
    if (userId) logPlaceView(userId, place.id)
    Keyboard.dismiss()
    deferredPush(`/lugares/${place.id}`)
  }, [debounced, recordSearch, userId])

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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <ChevronLeft size={24} color={T.fg1} />
        </TouchableOpacity>
        <View style={styles.inputCol}>
          <SearchInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
            query={debounced}
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
    backgroundColor: T.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: R.full,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  inputCol: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: S.lg,
    paddingBottom: 48,
  },
})
