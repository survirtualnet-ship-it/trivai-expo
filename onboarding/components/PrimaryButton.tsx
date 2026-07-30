import { memo, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { onboardingTheme as t } from '../lib/theme'

type Props = {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  style?: ViewStyle
  icon?: ReactNode
}

export const PrimaryButton = memo(function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  icon,
}: Props) {
  const handlePress = () => {
    if (disabled || loading) return
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, disabled && styles.disabled]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.row}>
              {icon}
              <Text style={styles.labelPrimary}>{label}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.secondary,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        style,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={t.text} />
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[styles.labelSecondary, variant === 'ghost' && styles.labelGhost]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  )
})

const styles = StyleSheet.create({
  wrap: {
    borderRadius: t.radius.lg,
    overflow: 'hidden',
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  gradient: {
    minHeight: 54,
    paddingHorizontal: t.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 54,
    paddingHorizontal: t.spacing.xl,
    borderRadius: t.radius.lg,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  labelPrimary: {
    color: '#fff',
    fontSize: t.font.body,
    fontWeight: '700',
  },
  labelSecondary: {
    color: t.text,
    fontSize: t.font.body,
    fontWeight: '600',
  },
  labelGhost: {
    color: t.textSecondary,
  },
})
