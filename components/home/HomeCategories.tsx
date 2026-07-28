import { memo, useCallback } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import { CATEGORY_CHIPS } from '@/lib/categories'
import { getCatImage } from '@/lib/catImages'
import { deferredPush } from '@/lib/deferredNav'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type CategoryItem = (typeof CATEGORY_CHIPS)[number]

const CARD_W = 136

export const HomeCategories = memo(function HomeCategories() {
  const openCategory = useCallback((id: string) => {
    deferredPush({ pathname: '/lugares', params: { cat: id } })
  }, [])

  const renderItem = useCallback(({ item }: ListRenderItemInfo<CategoryItem>) => {
    const image = getCatImage(item.id)

    return (
      <Pressable
        onPress={() => openCategory(item.id)}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <View style={[styles.swatch, { backgroundColor: item.color + '1A' }]}>
          {image ? (
            <Image source={image} style={styles.thumb} resizeMode="cover" />
          ) : (
            <Text style={styles.emoji}>{item.emoji}</Text>
          )}
          <View style={[styles.tint, { backgroundColor: item.color + '28' }]} />
        </View>
        <View style={styles.meta}>
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          <Tag label="Explorar" variant="secondary" size="sm" />
        </View>
      </Pressable>
    )
  }, [openCategory])

  return (
    <Section title="Categorías">
      <FlatList
        horizontal
        data={CATEGORY_CHIPS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        style={styles.listRoot}
      />
    </Section>
  )
})

const styles = StyleSheet.create({
  listRoot: {
    flexGrow: 0,
  },
  list: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  card: {
    width: CARD_W,
    borderRadius: R.xl,
    backgroundColor: T.surface,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  swatch: {
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
  },
  emoji: {
    fontSize: 28,
    zIndex: 1,
  },
  meta: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    gap: 6,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
})
