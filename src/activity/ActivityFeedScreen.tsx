import { useCallback, useMemo } from 'react'
import {
  Alert,
  FlatList,
  Share,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { router } from 'expo-router'
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

export function ActivityFeedScreen() {
  const user = useActivityStore(s => s.user)
  const selectedTab = useActivityStore(s => s.selectedTab)
  const activeFilter = useActivityStore(s => s.activeFilter)
  const activities = useActivityStore(s => s.activities)
  const isConnectedToFriends = useActivityStore(s => s.isConnectedToFriends)
  const friends = useActivityStore(s => s.friends)
  const setSelectedTab = useActivityStore(s => s.setSelectedTab)
  const setActiveFilter = useActivityStore(s => s.setActiveFilter)
  const connectFriends = useActivityStore(s => s.connectFriends)

  const activeFriendsCount = useMemo(
    () => friends.filter(f => f.isActive).length,
    [friends],
  )

  const feedData = useMemo(
    () => filterActivities(activities, selectedTab, activeFilter, user.id),
    [activities, selectedTab, activeFilter, user.id],
  )

  const showFriendsEmpty = selectedTab === 'friends' && !isConnectedToFriends
  const showFilters = selectedTab === 'personal' || isConnectedToFriends

  const handlePressPlace = useCallback((placeId: string) => {
    router.push(`/lugares/${placeId}`)
  }, [])

  const handlePressUser = useCallback(
    (userId: string) => {
      router.push('/profile')
    },
    [],
  )

  const handleInvite = useCallback(async () => {
    try {
      await Share.share({
        message: 'Únete a TRIVAI y descubre planes cerca conmigo → https://trivai-expo.vercel.app',
      })
    } catch {
      Alert.alert('Invitar amigos', 'Comparte el link de TRIVAI con tus contactos.')
    }
  }, [])

  const renderItem: ListRenderItem<FeedActivity> = useCallback(
    ({ item, index }) => (
      <ActivityItem
        item={item}
        index={index}
        isSelf={item.user.id === user.id}
        onPressPlace={handlePressPlace}
        onPressUser={handlePressUser}
      />
    ),
    [handlePressPlace, handlePressUser, user.id],
  )

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Actividad</Text>
        {selectedTab === 'friends' && isConnectedToFriends && activeFriendsCount > 0 && (
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>
              {activeFriendsCount} amigos activos ahora
            </Text>
          </View>
        )}
        <ActivityTabs selected={selectedTab} onSelect={setSelectedTab} />
        {showFilters && !showFriendsEmpty && (
          <FilterChips active={activeFilter} onSelect={setActiveFilter} />
        )}
      </View>

      {showFriendsEmpty ? (
        <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(200)} style={styles.flex}>
          <EmptyStateFriends onConnect={connectFriends} onInvite={handleInvite} />
        </Animated.View>
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
                <Text style={styles.emptyText}>No hay actividad con este filtro</Text>
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
  },
  emptyText: {
    color: activityTheme.textSecondary,
    fontSize: 15,
  },
})
