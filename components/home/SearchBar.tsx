import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Search } from 'lucide-react-native'
import { H } from '@/lib/home/theme'
import type { HomeLocale } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  locale: HomeLocale
  onPress: () => void
}

export const SearchBar = memo(function SearchBar({ locale, onPress }: Props) {
  const placeholder =
    locale === 'EN' ? 'Search places, services...' : 'Buscar lugares, servicios...'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
    >
      <View style={styles.bar}>
        <Search size={18} color={H.textSecondary} strokeWidth={2} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: H.padX,
    paddingTop: 16,
  },
  bar: {
    height: 44,
    borderRadius: H.radius,
    backgroundColor: H.searchBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  placeholder: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: H.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
})
