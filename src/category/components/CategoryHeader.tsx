import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { categoryTheme } from '../theme'

type Props = {
  title: string
  icon: string
  tint: string
}

export const CategoryHeader = memo(function CategoryHeader({ title, icon, tint }: Props) {
  const handleBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <Ionicons name="chevron-back" size={22} color={categoryTheme.text} />
      </Pressable>

      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={tint}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.backSpacer} />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: categoryTheme.spacing.lg,
    paddingTop: categoryTheme.spacing.sm,
    paddingBottom: categoryTheme.spacing.md,
    gap: categoryTheme.spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: categoryTheme.radius.full,
    backgroundColor: categoryTheme.surface,
    borderWidth: 1,
    borderColor: categoryTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: categoryTheme.spacing.md,
    minWidth: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: categoryTheme.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  backSpacer: {
    width: 40,
  },
})
