import { useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ActivityTabs } from './components/ActivityTabs'
import { FilterChips } from './components/FilterChips'
import { ActivityItem } from './components/ActivityItem'
import { EmptyStateFriends } from './components/EmptyStateFriends'
import {
  filterActivities,
  useActivityStore,
  type FeedActivity,
} from './store/useActivityStore'
import { activityTheme } from './theme'
import { useUser } from '@/hooks/useUser'
import { fetchFriendsFeed, fetchPersonalFeed } from '@/lib/activityFeed'
import { STALE } from '@/lib/queries/keys'

export function ActivityFeedScreen() {
  const { user, profile, isAuthenticated, avatarUrl, displayName } = useUser()
  const selectedTab = useActivityStore(s => s.selectedTab)
  const activeFilter = useActivityStore(s => s.activeFilter)
  const setSelectedTab = useActivityStore(s => s.setSelectedTab)
  const setActiveFilter = useActivityStore(s => s.setActiveFilter)

  const selfUser = useMemo(
    () => ({
      id: user?.id ?? '',
      name: profile?.full_name?.trim() || displayName || 'Tú',
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(displayName || 'T')}`,
    }),
    [user?.id, profile?.full_name, displayName, avatarUrl],
  )

  const personalQuery = useQuery({
    queryKey: ['activity', 'personal', user?.id ?? 'anon'],
    queryFn: () => fetchPersonalFeed(user!.id, selfUser),
    enabled: !!user?.id && selectedTab === 'personal',
    staleTime: STALE.user,
  })

  const friendsQuery = useQuery({
    queryKey: ['activity', 'friends', user?.id ?? 'anon'],
    queryFn: () => fetchFriendsFeed(user!.id),
    enabled: !!user?.id && selectedTab === 'friends',
    staleTime: STALE.user,
  })

  const friends = friendsQuery.data?.friends ?? []
  const activities =
    selectedTab === 'personal'
      ? (personalQuery.data ?? []).map(a => ({ ...a, scope: 'personal' as const }))
      : (friendsQuery.data?.activities ?? []).map(a => ({
          ...a,
          scope: 'friends' as const,
        }))

  const activeFriendsCount = useMemo(
    () => friends.filter(f => f.isActive).length,
    [friends],
  )

  const feedData = useMemo(
    () => filterActivities(activities, selectedTab, activeFilter),
    [activities, selectedTab, activeFilter],
  )

  const loading =
    selectedTab === 'personal' ? personalQuery.isLoading : friendsQuery.isLoading
  const showFriendsEmpty =
    selectedTab === 'friends' &&
    !friendsQuery.isLoading &&
    friends.length === 0
  const showFilters = selectedTab === 'personal' || friends.length > 0

  const handlePressPlace = useCallback((placeId: string) => {
    router.push(`/place/${placeId}`)
  }, [])

  const handlePressUser = useCallback((userId: string) => {
    if (!userId) return
    if (userId === user?.id) {
      router.push('/(tabs)/profile')
      return
    }
    router.push(`/perfil/${userId}`)
  }, [user?.id])

  const handleInvite = useCallback(async () => {
    try {
      await Share.share({
        message:
          'Únete a TRIVAI y descubre planes cerca conmigo → https://trivai-expo.vercel.app',
      })
    } catch {
      Alert.alert('Invitar amigos', 'Comparte el link de TRIVAI con tus contactos.')
    }
  }, [])

  const handleConnectFriends = useCallback(() => {
    router.push('/amigos')
  }, [])

  const renderItem: ListRenderItem<FeedActivity> = useCallback(
    ({ item, index }) => (
      <ActivityItem
        item={item}
        index={index}
        isSelf={item.user.id === user?.id}
        onPressPlace={handlePressPlace}
        onPressUser={handlePressUser}
      />
    ),
    [handlePressPlace, handlePressUser, user?.id],
  )

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.stickyHeader}>
          <Text style={styles.title}>Actividad</Text>
        </View>
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>Tu actividad vive aquí</Text>
          <Text style={styles.guestSub}>
            Inicia sesión para ver tus exploraciones, guardados y reseñas — y lo
            que hacen tus amigos.
          </Text>
          <Pressable
            style={styles.guestBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.guestBtnText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Actividad</Text>
        {selectedTab === 'friends' && friends.length > 0 && activeFriendsCount > 0 && (
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>
              {activeFriendsCount} amigos activos recientemente
            </Text>
          </View>
        )}
        <ActivityTabs selected={selectedTab} onSelect={setSelectedTab} />
        {showFilters && !showFriendsEmpty ? (
          <FilterChips active={activeFilter} onSelect={setActiveFilter} />
        ) : null}
      </View>

      {showFriendsEmpty ? (
        <Animated.View
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(200)}
          style={styles.flex}
        >
          <EmptyStateFriends
            onConnect={handleConnectFriends}
            onInvite={handleInvite}
          />
        </Animated.View>
      ) : loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={activityTheme.accent} />
          <Text style={styles.emptyText}>Cargando actividad real…</Text>
        </View>
      ) : (
        <Animated.View
          key={`${selectedTab}-${activeFilter}`}
          entering={FadeIn.duration(280)}
          exiting={FadeOut.duration(180)}
          style={styles.flex}
        >
          <FlatList
            data={feedData}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {selectedTab === 'personal'
                    ? 'Aún no hay actividad tuya'
                    : 'Tus amigos todavía no se mueven aquí'}
                </Text>
                <Text style={styles.emptyText}>
                  {selectedTab === 'personal'
                    ? 'Explora un lugar, guárdalo o deja una reseña. Eso aparece aquí al instante.'
                    : 'Cuando tus amigos guarden o reseñen lugares, lo verás en este feed.'}
                </Text>
                {selectedTab === 'personal' ? (
                  <Pressable
                    style={styles.guestBtn}
                    onPress={() => router.push('/(tabs)/')}
                  >
                    <Text style={styles.guestBtnText}>Explorar lugares</Text>
                  </Pressable>
                ) : null}
              </View>
            }
          />
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: activityTheme.bg,
  },
  flex: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: activityTheme.bg,
    paddingBottom: activityTheme.spacing.sm,
    gap: activityTheme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: activityTheme.border,
    zIndex: 10,
  },
  title: {
    paddingHorizontal: activityTheme.spacing.lg,
    paddingTop: activityTheme.spacing.md,
    color: activityTheme.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginHorizontal: activityTheme.spacing.lg,
    gap: 8,
    paddingHorizontal: activityTheme.spacing.md,
    paddingVertical: 8,
    borderRadius: activityTheme.radius.full,
    backgroundColor: activityTheme.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(109,94,247,0.35)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: activityTheme.success,
  },
  activeText: {
    color: activityTheme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingTop: activityTheme.spacing.md,
    paddingBottom: 100,
  },
  empty: {
    padding: activityTheme.spacing.xxl,
    alignItems: 'center',
    gap: activityTheme.spacing.md,
  },
  emptyTitle: {
    color: activityTheme.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: activityTheme.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  guestCard: {
    margin: activityTheme.spacing.lg,
    padding: activityTheme.spacing.xxl,
    borderRadius: activityTheme.radius.lg,
    backgroundColor: activityTheme.surface,
    borderWidth: 1,
    borderColor: activityTheme.border,
    gap: activityTheme.spacing.md,
    alignItems: 'center',
  },
  guestTitle: {
    color: activityTheme.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  guestSub: {
    color: activityTheme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  guestBtn: {
    marginTop: 8,
    backgroundColor: activityTheme.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  guestBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
})
