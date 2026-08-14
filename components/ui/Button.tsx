import { memo, type ReactNode } from 'react'
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R, SHADOW, components, colors } from '@/src/design'
import { FONT } from '@/lib/typography'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  haptic?: boolean
}

function TrivaiButtonBase({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  haptic = true,
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const isDanger = variant === 'danger'
  const isGhost = variant === 'ghost'
  const isLg = size === 'lg'

  const handlePress = () => {
    if (disabled || loading) return
    if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        isLg && styles.baseLg,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary || isDanger ? colors.onPrimary : T.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isLg && styles.labelLg,
              isPrimary && styles.labelPrimary,
              variant === 'secondary' && styles.labelSecondary,
              isGhost && styles.labelGhost,
              isDanger && styles.labelDanger,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

/** Official Trivai primary CTA — orange, rounded, consistent height */
export const PrimaryButton = memo(TrivaiButtonBase)

/** @deprecated Prefer PrimaryButton — kept for existing imports */
export const Button = PrimaryButton

export const SecondaryButton = memo(function SecondaryButton(
  props: Omit<ButtonProps, 'variant'>,
) {
  return <PrimaryButton {...props} variant="secondary" />
})

export const GhostButton = memo(function GhostButton(
  props: Omit<ButtonProps, 'variant'>,
) {
  return <PrimaryButton {...props} variant="ghost" />
})

type IconButtonProps = {
  onPress: () => void
  icon: ReactNode
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'surface' | 'ghost'
  accessibilityLabel: string
  style?: StyleProp<ViewStyle>
}

export const IconButton = memo(function IconButton({
  onPress,
  icon,
  disabled = false,
  size = 'md',
  variant = 'surface',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const dim = size === 'sm' ? components.iconButton.sizeSm : components.iconButton.size

  const handlePress = () => {
    if (disabled) return
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconBtn,
        { width: dim, height: dim },
        variant === 'surface' && styles.iconBtnSurface,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  )
})

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    paddingHorizontal: components.button.paddingHorizontal,
    borderRadius: components.button.borderRadius,
    minHeight: components.button.height,
  },
  baseLg: {
    minHeight: components.button.heightLg,
    borderRadius: R.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: T.primary,
    ...SHADOW.sm,
  },
  secondary: {
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: T.danger,
    ...SHADOW.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
  },
  labelLg: {
    fontSize: F.size.lg,
  },
  labelPrimary: {
    color: colors.onPrimary,
  },
  labelSecondary: {
    color: T.fg1,
  },
  labelGhost: {
    color: T.primary,
  },
  labelDanger: {
    color: colors.onPrimary,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: components.iconButton.borderRadius,
  },
  iconBtnSurface: {
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
})
