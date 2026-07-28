import { memo, useCallback, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft, Share2, Heart } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const { width: SCREEN_W } = Dimensions.get('window')
const HERO_H = 420

type Props = {
  category: string
  images: string[]
  isFavorite: boolean
  isFeatured?: boolean
  isSponsored?: boolean
  onShare: () => void
  onToggleFavorite: () => void
  favoritePending?: boolean
}

export const PlaceHeader = memo(function PlaceHeader({
  category,
  images,
  isFavorite,
  isFeatured,
  isSponsored,
  onShare,
  onToggleFavorite,
  favoritePending,
}: Props) {
  const insets = useSafeAreaInsets()
  const [activeIndex, setActiveIndex] = useState(0)
  const slides = images.length > 0 ? images : [null]

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
  }, [])

  return (
    <View style={styles.wrap}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        keyExtractor={(_, i) => `hero-${i}`}
        renderItem={({ item }) => (
          item ? (
            <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
          ) : (
            <CatCover category={category} variant="hero" style={styles.image} />
          )
        )}
      />

      <View style={[styles.overlayTop, { paddingTop: insets.top + S.sm }]}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={T.fg1} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.overlayRight}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Compartir"
            hitSlop={8}
          >
            <Share2 size={18} color={T.fg1} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={onToggleFavorite}
            disabled={favoritePending}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Quitar de guardados' : 'Guardar'}
            hitSlop={8}
          >
            <Heart
              size={20}
              color={isFavorite ? T.danger : T.fg1}
              fill={isFavorite ? T.danger : 'transparent'}
              strokeWidth={2.2}
            />
          </Pressable>
        </View>
      </View>

      {(isFeatured || isSponsored) && (
        <View style={[styles.promoBadge, { top: insets.top + 58 }]}>
          <Text style={styles.promoText}>{isSponsored ? 'Patrocinado' : 'Destacado'}</Text>
        </View>
      )}

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  )
})

export const PLACE_HERO_HEIGHT = HERO_H

const styles = StyleSheet.create({
  wrap: {
    height: HERO_H,
    backgroundColor: T.muted,
  },
  image: {
    width: SCREEN_W,
    height: HERO_H,
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
  },
  overlayRight: {
    flexDirection: 'row',
    gap: S.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  promoBadge: {
    position: 'absolute',
    left: S.lg,
    backgroundColor: 'rgba(21,19,26,0.55)',
    paddingHorizontal: S.md,
    paddingVertical: 5,
    borderRadius: R.full,
  },
  promoText: {
    fontFamily: FONT.medium,
    fontSize: F.size.xs,
    color: '#fff',
  },
  dots: {
    position: 'absolute',
    bottom: S.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#fff',
  },
})
