import { memo } from 'react'
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { SearchCategoryRow } from '@/components/search/SearchCategoryRow'
import { SearchPlaceRow } from '@/components/search/SearchPlaceRow'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { ExplorerPlace } from '@/lib/explorerRanking'
import type { SearchCategory } from '@/lib/search'

type Props = {
  query: string
  places: ExplorerPlace[]
  categories: SearchCategory[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  onPlacePress: (place: ExplorerPlace) => void
  onCategoryPress: (category: SearchCategory) => void
}

export const SearchResults = memo(function SearchResults({
  query,
  places,
  categories,
  loading,
  error,
  onRetry,
  onPlacePress,
  onCategoryPress,
}: Props) {
  if (error) {
    return (
      <View style={styles.center} accessibilityRole="alert">
        <Text style={styles.emptyTitle}>No pudimos buscar</Text>
        <Text style={styles.emptySub}>Revisa tu conexión e intenta de nuevo</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar">
            <Text style={styles.retry}>Reintentar</Text>
          </Pressable>
        ) : null}
      </View>
    )
  }

  const empty = !loading && places.length === 0 && categories.length === 0

  if (loading && places.length === 0 && categories.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.fg3} />
      </View>
    )
  }

  if (empty) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Sin resultados</Text>
        <Text style={styles.emptySub}>Prueba con otro término</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap}>
      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {categories.map(cat => (
            <SearchCategoryRow
              key={cat.id}
              category={cat}
              query={query}
              onPress={onCategoryPress}
            />
          ))}
        </View>
      )}

      {places.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lugares
            {loading ? '' : ` · ${places.length}`}
          </Text>
          {places.map(place => (
            <SearchPlaceRow
              key={place.id}
              place={place}
              query={query}
              onPress={() => onPlacePress(place)}
            />
          ))}
        </View>
      )}

      {loading && places.length > 0 && (
        <ActivityIndicator color={T.fg3} style={styles.loader} />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingTop: S.xs,
  },
  section: {
    marginBottom: S.xl,
  },
  sectionTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg3,
    marginBottom: 4,
    paddingHorizontal: S.lg,
  },
  center: {
    alignItems: 'center',
    paddingVertical: S.xxxl,
    gap: S.sm,
    paddingHorizontal: S.xl,
  },
  emptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  emptySub: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
  },
  retry: {
    fontFamily: FONT.medium,
    fontSize: F.size.md,
    color: T.primary,
    marginTop: S.sm,
  },
  loader: {
    marginTop: S.md,
    marginBottom: S.lg,
  },
})
