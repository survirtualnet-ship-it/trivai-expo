import { memo, useState, type ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label?: string
  icon?: LucideIcon
  containerStyle?: StyleProp<ViewStyle>
  error?: string
  rightElement?: ReactNode
  password?: boolean
}

export const AuthInput = memo(function AuthInput({
  label,
  icon: Icon,
  containerStyle,
  error,
  rightElement,
  password = false,
  secureTextEntry,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)

  const isSecure = password ? !visible : secureTextEntry

  return (
    <View style={[styles.wrap, containerStyle]} pointerEvents="box-none">
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {Icon ? (
          <Icon size={18} color={focused ? t.accent : t.textMuted} />
        ) : null}
        <TextInput
          {...inputProps}
          editable={inputProps.editable !== false}
          secureTextEntry={isSecure}
          style={styles.input}
          placeholderTextColor={t.textMuted}
          onFocus={e => {
            setFocused(true)
            inputProps.onFocus?.(e)
          }}
          onBlur={e => {
            setFocused(false)
            inputProps.onBlur?.(e)
          }}
        />
        {password ? (
          <Pressable
            onPress={() => setVisible(v => !v)}
            hitSlop={8}
            style={styles.trailingBtn}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible
              ? <EyeOff size={18} color={t.textMuted} />
              : <Eye size={18} color={t.textMuted} />
            }
          </Pressable>
        ) : rightElement ? (
          <View style={styles.trailingBtn}>{rightElement}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    gap: t.spacing.sm,
  },
  label: {
    fontSize: t.font.caption,
    fontWeight: '600',
    color: t.text,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    minHeight: 52,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.surface,
    paddingHorizontal: t.spacing.lg,
  },
  fieldFocused: {
    borderColor: t.accent,
  },
  fieldError: {
    borderColor: t.accentSecondary,
  },
  input: {
    flex: 1,
    fontSize: t.font.body,
    color: t.text,
    paddingVertical: t.spacing.md,
  },
  trailingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  errorText: {
    fontSize: t.font.caption,
    color: t.accentSecondary,
  },
})
