import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInLeft } from 'react-native-reanimated'
import { router } from 'expo-router'
import { profileTheme } from '../theme'
import {
  formatTimeAgo,
  type ActivityType,
} from '@/src/activity/store/useActivityStore'

export type ProfileActivityRow = {
  id: string
  placeId: string
  placeName: string
  imageUrl: string
  timestamp: number
  type: ActivityType
}

type Props = {
  item: ProfileActivityRow
  index: number
}

function pillFor(type: ActivityType): { label: string; visited: boolean } {
  if (type === 'save') return { label: 'Guardado', visited: false }
  if (type === 'visit') return { label: 'Reseña', visited: true }
  if (type === 'checkin') return { label: 'En vivo', visited: true }
  return { label: 'Explorado', visited: false }
}

export const ActivityItem = memo(function ActivityItem({ item, index }: Props) {
  const pill = pillFor(item.type)

  return (
    <Animated.View entering={FadeInLeft.delay(index * 50).duration(350)}>
      <Pressable
        onPress={() => router.push(`/place/${item.placeId}`)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {item.placeName}
          </Text>
          <Text style={styles.date}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        <View style={[styles.pill, pill.visited ? styles.pillVisited : styles.pillSaved]}>
          <Text
            style={[
              styles.pillText,
              pill.visited ? styles.pillTextVisited : styles.pillTextSaved,
            ]}
          >
            {pill.label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.md,
    paddingVertical: profileTheme.spacing.md,
    paddingHorizontal: profileTheme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: profileTheme.border,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: profileTheme.surfaceElevated,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: profileTheme.radius.sm,
    backgroundColor: profileTheme.surfaceElevated,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: profileTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    color: profileTheme.textMuted,
    fontSize: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: profileTheme.radius.full,
  },
  pillVisited: {
    backgroundColor: 'rgba(52,211,153,0.15)',
  },
  pillSaved: {
    backgroundColor: profileTheme.accentSoft,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextVisited: {
    color: profileTheme.success,
  },
  pillTextSaved: {
    color: profileTheme.accent,
  },
})
