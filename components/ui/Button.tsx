import { memo, type ReactNode } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type StyleProp,
} from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'md' | 'lg'

type Props = {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
}

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: Props) {
  const isPrimary = variant === 'primary'
  const isLg = size === 'lg'

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isLg && styles.baseLg,
        isPrimary ? styles.primary : styles.secondary,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? '#fff' : T.primary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              isLg && styles.labelLg,
              isPrimary ? styles.labelPrimary : styles.labelSecondary,
            ]}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    paddingHorizontal: S.xl,
    paddingVertical: 12,
    borderRadius: R.lg,
    minHeight: 44,
  },
  baseLg: {
    paddingVertical: 16,
    minHeight: 52,
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
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
  },
  labelLg: {
    fontSize: F.size.lg,
  },
  labelPrimary: {
    color: '#fff',
  },
  labelSecondary: {
    color: T.fg1,
  },
})
