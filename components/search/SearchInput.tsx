import { memo, forwardRef } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInput as TextInputType,
} from 'react-native'
import { Search, X } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export const SearchInput = memo(forwardRef<TextInputType, Props>(function SearchInput(
  {
    value,
    onChangeText,
    placeholder = 'What are you looking for?',
    autoFocus = true,
  },
  ref,
) {
  const active = value.trim().length > 0

  return (
    <View style={[styles.wrap, active && styles.wrapActive]}>
      <Search size={22} color={active ? T.primary : T.fg3} strokeWidth={2} />
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.fg4}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityLabel="Clear search"
        >
          <X size={20} color={T.fg3} />
        </TouchableOpacity>
      )}
    </View>
  )
}))

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    paddingHorizontal: S.lg,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  wrapActive: {
    borderColor: T.primary,
    ...SHADOW.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
    paddingVertical: S.md,
  },
})
