import { memo, type ReactNode } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export type ActionButtonVariant = 'primary' | 'secondary' | 'ghost'

export type ActionButtonProps = {
  label: string
  icon?: ReactNode
  onPress: () => void
  variant?: ActionButtonVariant
  disabled?: boolean
  loading?: boolean
  flex?: boolean
  haptic?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

async function lightHaptic() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  } catch { /* web */ }
}

export const ActionButton = memo(function ActionButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
  disabled = false,
  loading = false,
  flex = true,
  haptic = true,
  style,
  accessibilityLabel,
}: ActionButtonProps) {
  const handlePress = () => {
    if (haptic) lightHaptic()
    onPress()
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        flex && styles.flex,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : T.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variant === 'primary' && styles.labelPrimary,
              variant === 'ghost' && styles.labelGhost,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: S.sm,
    paddingHorizontal: S.sm,
    borderRadius: R.lg,
    minHeight: 56,
  },
  flex: {
    flex: 1,
  },
  primary: {
    backgroundColor: T.primary,
    ...SHADOW.sm,
  },
  secondary: {
    backgroundColor: T.bg,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
    color: T.fg2,
    textAlign: 'center',
  },
  labelPrimary: {
    color: '#fff',
  },
  labelGhost: {
    color: T.primary,
  },
})
