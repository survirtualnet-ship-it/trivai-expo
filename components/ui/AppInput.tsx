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
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = Omit<TextInputProps, 'style'> & {
  label?: string
  icon?: LucideIcon
  containerStyle?: StyleProp<ViewStyle>
  error?: string
  rightElement?: ReactNode
  password?: boolean
}

export const AppInput = memo(function AppInput({
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
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {Icon ? (
          <Icon size={18} color={focused ? T.primary : T.fg3} />
        ) : null}
        <TextInput
          {...inputProps}
          secureTextEntry={isSecure}
          style={styles.input}
          placeholderTextColor={T.fg4}
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
              ? <EyeOff size={18} color={T.fg3} />
              : <Eye size={18} color={T.fg3} />
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
    gap: S.sm,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    minHeight: 52,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: T.border,
    backgroundColor: T.surface,
    paddingHorizontal: S.lg,
  },
  fieldFocused: {
    borderColor: T.primary,
  },
  fieldError: {
    borderColor: T.danger,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
    paddingVertical: S.md,
  },
  trailingBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: F.size.xs,
    color: T.danger,
  },
})
