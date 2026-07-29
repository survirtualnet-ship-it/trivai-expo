import { FlatList, StyleSheet, Text, View, type ListRenderItemInfo } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCallback } from 'react'
import { ACTIVITIES, type ActivityItem } from '../data/mock'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'

export function ActividadesScreen() {
  const renderItem = useCallback(({ item }: ListRenderItemInfo<ActivityItem>) => (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarText}>{item.friendName.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{item.friendName}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  ), [])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Text style={styles.title}>Actividades</Text>
      <FlatList
        data={ACTIVITIES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.soft,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.section,
    fontWeight: fontWeight.semibold,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  text: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  time: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
  },
})
