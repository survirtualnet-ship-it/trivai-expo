import { memo, forwardRef } from 'react'
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  type TextInput as TextInputType,
} from 'react-native'
import { Search, X } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
  onSubmit?: () => void
}

export const SearchInput = memo(forwardRef<TextInputType, Props>(function SearchInput(
  {
    value,
    onChangeText,
    placeholder = 'Buscar',
    autoFocus = true,
    onSubmit,
  },
  ref,
) {
  return (
    <View style={styles.wrap}>
      <Search size={17} color={T.fg3} strokeWidth={2.2} />
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.fg3}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
        clearButtonMode="never"
        onSubmitEditing={onSubmit}
        enablesReturnKeyAutomatically
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityLabel="Limpiar"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <View style={styles.clear}>
            <X size={12} color="#fff" strokeWidth={3} />
          </View>
        </Pressable>
      )}
    </View>
  )
}))

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.muted,
    borderRadius: 12,
    paddingHorizontal: S.md,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
    paddingVertical: 8,
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.fg4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
})
