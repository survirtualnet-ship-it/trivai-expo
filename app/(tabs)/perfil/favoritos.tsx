import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ScreenHeader from '@/components/ScreenHeader'
import { FavoritesEmptyState } from '@/components/favorites/FavoritesEmptyState'
import { FavoritesSection } from '@/components/favorites/FavoritesSection'
import { useFavoritePlaces } from '@/hooks/useFavoritePlaces'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export default function FavoritesScreen() {
  const {
    isAuthenticated,
    groups,
    isLoading,
    isError,
    refetch,
    total,
  } = useFavoritePlaces()

  const showEmpty = !isLoading && (total === 0 || !isAuthenticated)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Favoritos" fallbackHref="/(tabs)/perfil" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={T.primary} />
        </View>
      ) : showEmpty ? (
        <FavoritesEmptyState isAuthenticated={isAuthenticated} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={T.primary}
            />
          }
        >
          {isError && (
            <Text style={styles.error}>
              No pudimos actualizar. Desliza para reintentar.
            </Text>
          )}

          <Text style={styles.summary}>
            {total} lugar{total !== 1 ? 'es' : ''} guardado{total !== 1 ? 's' : ''}
          </Text>

          {groups.map(group => (
            <FavoritesSection key={group.id} group={group} />
          ))}

          <View style={styles.footer} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
  },
  summary: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginBottom: S.lg,
  },
  error: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.danger,
    marginBottom: S.md,
  },
  footer: {
    height: 40,
  },
})
