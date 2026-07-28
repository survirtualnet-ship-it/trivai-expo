import { memo } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'
import { ExplorerPlaceCard } from '@/components/explorer/ExplorerPlaceCard'
import { SearchCategoryRow } from '@/components/search/SearchCategoryRow'
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
        {onRetry && (
          <TouchableOpacity onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar">
            <Text style={styles.retry}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const empty = !loading && places.length === 0 && categories.length === 0

  if (loading && places.length === 0 && categories.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    )
  }

  if (empty) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>Sin resultados</Text>
        <Text style={styles.emptySub}>
          Prueba otra búsqueda de lugares o categorías en Santa Cruz
        </Text>
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
            Lugares · {places.length}
          </Text>
          {places.map(place => (
            <ExplorerPlaceCard
              key={place.id}
              place={place}
              fullWidth
              onPress={() => onPlacePress(place)}
            />
          ))}
        </View>
      )}

      {loading && (
        <ActivityIndicator color={T.primary} style={styles.loader} />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingTop: S.md,
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
  },
  center: {
    alignItems: 'center',
    paddingVertical: S.xxxl,
    gap: S.md,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  emptySub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
    paddingHorizontal: S.xl,
  },
  retry: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
  },
  loader: {
    marginTop: S.md,
  },
})
