import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Search } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  onPress: () => void
  placeholder?: string
}

export const HomeSearchBar = memo(function HomeSearchBar({
  onPress,
  placeholder = 'Buscar lugares, planes…',
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="search"
      accessibilityLabel="Buscar"
    >
      <Search size={18} color={T.fg3} strokeWidth={2} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginHorizontal: S.lg,
    marginBottom: S.xxl,
    paddingHorizontal: S.lg,
    minHeight: 48,
    borderRadius: R.full,
    backgroundColor: T.surface,
    ...SHADOW.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  placeholder: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
})
