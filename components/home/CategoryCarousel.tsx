import { memo, useCallback } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { H, homeShadow } from '@/lib/home/theme'
import type { HomeCategory, HomeLocale } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  categories: HomeCategory[]
  locale: HomeLocale
  selectedId?: string | null
  onSelect: (category: HomeCategory) => void
}

export const CategoryCarousel = memo(function CategoryCarousel({
  categories,
  locale,
  selectedId,
  onSelect,
}: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HomeCategory>) => {
      const label = locale === 'EN' ? item.labelEn : item.labelEs
      const selected = selectedId === item.id
      return (
        <Pressable
          onPress={() => onSelect(item)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityLabel={label}
        >
          <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
            {label}
          </Text>
        </Pressable>
      )
    },
    [locale, onSelect, selectedId],
  )

  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: H.sectionGap,
  },
  listRoot: {
    flexGrow: 0,
  },
  list: {
    paddingHorizontal: H.padX,
    gap: 14,
  },
  item: {
    width: 72,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: H.radius,
    backgroundColor: H.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...homeShadow.soft,
  },
  iconBoxSelected: {
    borderColor: H.accent,
    backgroundColor: '#E8F2FF',
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: H.text,
    textAlign: 'center',
    lineHeight: 15,
  },
  labelSelected: {
    color: H.accent,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
})
