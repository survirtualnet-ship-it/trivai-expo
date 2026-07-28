import { useState, useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { List, LayoutGrid, ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { FavoritesEmptyState } from '@/components/favorites/FavoritesEmptyState'
import { FavoritesSection } from '@/components/favorites/FavoritesSection'
import { useFavoritePlaces } from '@/hooks/useFavoritePlaces'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type LayoutMode = 'list' | 'grid'

export default function FavoritesScreen() {
  const {
    isAuthenticated,
    groups,
    isLoading,
    isError,
    refetch,
    total,
  } = useFavoritePlaces()

  const [layout, setLayout] = useState<LayoutMode>('list')
  const [refreshing, setRefreshing] = useState(false)

  const showEmpty = !isLoading && (total === 0 || !isAuthenticated)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const goBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)/perfil')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.nav}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={T.primary} strokeWidth={2.2} />
          <Text style={styles.backText}>Perfil</Text>
        </Pressable>

        {!showEmpty && !isLoading && (
          <View style={styles.toggle}>
            <Pressable
              onPress={() => setLayout('list')}
              style={[styles.toggleBtn, layout === 'list' && styles.toggleActive]}
              accessibilityRole="button"
              accessibilityLabel="Vista lista"
              accessibilityState={{ selected: layout === 'list' }}
            >
              <List size={16} color={layout === 'list' ? T.fg1 : T.fg3} strokeWidth={2.2} />
            </Pressable>
            <Pressable
              onPress={() => setLayout('grid')}
              style={[styles.toggleBtn, layout === 'grid' && styles.toggleActive]}
              accessibilityRole="button"
              accessibilityLabel="Vista grilla"
              accessibilityState={{ selected: layout === 'grid' }}
            >
              <LayoutGrid size={16} color={layout === 'grid' ? T.fg1 : T.fg3} strokeWidth={2.2} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>Guardados</Text>
        {!showEmpty && !isLoading && (
          <Text style={styles.subtitle}>
            {total} lugar{total !== 1 ? 'es' : ''}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.fg3} />
        </View>
      ) : showEmpty ? (
        <FavoritesEmptyState isAuthenticated={isAuthenticated} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          decelerationRate="fast"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={T.fg3}
            />
          }
        >
          {isError && (
            <Text style={styles.error}>
              No pudimos actualizar. Desliza para reintentar.
            </Text>
          )}

          {groups.map(group => (
            <FavoritesSection key={group.id} group={group} layout={layout} />
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
    backgroundColor: T.surface,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingTop: S.xs,
    minHeight: 44,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -6,
  },
  backText: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.primary,
  },
  pressed: {
    opacity: 0.55,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: T.muted,
    borderRadius: R.md,
    padding: 2,
  },
  toggleBtn: {
    width: 34,
    height: 28,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: T.surface,
  },
  titleBlock: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.lg,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 34,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingTop: S.sm,
    paddingBottom: S.xxxl,
  },
  error: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.danger,
    paddingHorizontal: S.lg,
    marginBottom: S.md,
  },
  footer: {
    height: 24,
  },
})
