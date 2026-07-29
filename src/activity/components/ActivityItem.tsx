import { memo, useEffect } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { activityTheme } from '../theme'
import {
  activityActionText,
  formatTimeAgo,
  type FeedActivity,
} from '../store/useActivityStore'

type Props = {
  item: FeedActivity
  index: number
  isSelf: boolean
  onPressPlace: (placeId: string) => void
  onPressUser: (userId: string) => void
}

export const ActivityItem = memo(function ActivityItem({
  item,
  index,
  isSelf,
  onPressPlace,
  onPressUser,
}: Props) {
  const isCheckin = item.type === 'checkin'
  const glow = useSharedValue(0)

  useEffect(() => {
    if (!isCheckin) return
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.35, { duration: 900 }),
      ),
      -1,
      true,
    )
  }, [isCheckin, glow])

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: isCheckin
      ? `rgba(255,107,53,${0.35 + glow.value * 0.45})`
      : activityTheme.border,
    shadowOpacity: isCheckin ? 0.25 + glow.value * 0.25 : 0.2,
  }))

  const action = activityActionText(item.type, item.user.name, isSelf)

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(320).springify()}>
      <Animated.View style={[styles.card, isCheckin && styles.cardLive, glowStyle]}>
        {isCheckin && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN VIVO</Text>
          </View>
        )}

        <Pressable
          onPress={() => {
            void Haptics.selectionAsync()
            onPressUser(item.user.id)
          }}
          style={styles.userRow}
        >
          <Image source={{ uri: item.user.avatarUrl }} style={styles.avatar} />
          <View style={styles.userText}>
            <Text style={styles.userName}>{isSelf ? 'Tú' : item.user.name}</Text>
            <Text style={styles.action}>{action}</Text>
          </View>
          <Text style={styles.time}>{formatTimeAgo(item.timestamp)}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            onPressPlace(item.place.id)
          }}
          style={({ pressed }) => [styles.placeRow, pressed && styles.placePressed]}
        >
          <Image source={{ uri: item.place.imageUrl }} style={styles.placeImage} />
          <View style={styles.placeBody}>
            <Text style={styles.placeName} numberOfLines={1}>{item.place.name}</Text>
            <Text style={styles.placeMeta} numberOfLines={1}>
              {item.place.category} · ★ {item.place.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: activityTheme.spacing.lg,
    marginBottom: activityTheme.spacing.md,
    padding: activityTheme.spacing.lg,
    borderRadius: activityTheme.radius.lg,
    backgroundColor: activityTheme.surface,
    borderWidth: 1,
    borderColor: activityTheme.border,
    gap: activityTheme.spacing.md,
    shadowColor: activityTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLive: {
    backgroundColor: activityTheme.liveSoft,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: activityTheme.radius.full,
    backgroundColor: 'rgba(255,107,53,0.25)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: activityTheme.live,
  },
  liveText: {
    color: activityTheme.live,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: activityTheme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: activityTheme.surfaceElevated,
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: activityTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  action: {
    color: activityTheme.textSecondary,
    fontSize: 13,
  },
  time: {
    color: activityTheme.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: activityTheme.spacing.md,
    padding: activityTheme.spacing.sm,
    borderRadius: activityTheme.radius.md,
    backgroundColor: activityTheme.surfaceElevated,
  },
  placePressed: {
    opacity: 0.88,
  },
  placeImage: {
    width: 56,
    height: 56,
    borderRadius: activityTheme.radius.sm,
    backgroundColor: activityTheme.bg,
  },
  placeBody: {
    flex: 1,
    gap: 2,
  },
  placeName: {
    color: activityTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  placeMeta: {
    color: activityTheme.textSecondary,
    fontSize: 12,
  },
  chevron: {
    color: activityTheme.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
})
