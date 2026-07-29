import { memo, useCallback, type ComponentProps } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { I, SP, RD, cardShadow } from '@/lib/inicio/theme'
import type { InicioCategory, InicioLocale } from '@/lib/inicio/mockData'
import { FONT } from '@/lib/typography'

type Props = {
  categories: InicioCategory[]
  locale: InicioLocale
  onSelect: (category: InicioCategory) => void
}

type IoniconName = ComponentProps<typeof Ionicons>['name']

export const CategoriesGrid = memo(function CategoriesGrid({
  categories,
  locale,
  onSelect,
}: Props) {
  const { width } = useWindowDimensions()
  const gap = SP.md
  const pad = SP.lg
  const cardW = (width - pad * 2 - gap) / 2

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<InicioCategory>) => {
      const title = locale === 'EN' ? item.titleEn : item.titleEs
      return (
        <Pressable
          onPress={() => onSelect(item)}
          style={({ pressed }) => [
            styles.card,
            { width: cardW },
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${item.tint}18` }]}>
            <Ionicons name={item.icon as IoniconName} size={22} color={item.tint} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </Pressable>
      )
    },
    [cardW, locale, onSelect],
  )

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        {locale === 'EN' ? 'Categories' : 'Categorías'}
      </Text>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: SP.xxl,
    gap: SP.lg,
  },
  heading: {
    paddingHorizontal: SP.lg,
    fontFamily: FONT.semibold,
    fontSize: 20,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.3,
  },
  listRoot: {
    flexGrow: 0,
  },
  grid: {
    paddingHorizontal: SP.lg,
    gap: SP.md,
  },
  row: {
    gap: SP.md,
  },
  card: {
    backgroundColor: I.card,
    borderRadius: RD.md,
    paddingVertical: SP.lg,
    paddingHorizontal: SP.lg,
    gap: SP.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: I.border,
    ...cardShadow,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
})
