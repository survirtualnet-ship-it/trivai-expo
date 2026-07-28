import { memo, useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft, Share2, Heart } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const { width: SCREEN_W } = Dimensions.get('window')
const HERO_H = 400

type Props = {
  name: string
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
  name,
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
  const hasPhotos = images.length > 0
  const slides = hasPhotos ? images : [null]

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    setActiveIndex(Math.round(x / SCREEN_W))
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
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Volver">
          <ChevronLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <View style={styles.overlayRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={onShare} accessibilityLabel="Compartir">
            <Share2 size={20} color={T.fg1} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onToggleFavorite}
            disabled={favoritePending}
            accessibilityLabel="Guardar"
          >
            <Heart
              size={22}
              color={isFavorite ? T.danger : T.fg1}
              fill={isFavorite ? T.danger : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {(isFeatured || isSponsored) && (
        <View style={[styles.promoBadge, { top: insets.top + 56 }]}>
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

      <View style={styles.gradientFade} pointerEvents="none" />
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
    paddingHorizontal: S.md,
  },
  overlayRight: {
    flexDirection: 'row',
    gap: S.sm,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  promoBadge: {
    position: 'absolute',
    left: S.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: S.md,
    paddingVertical: 5,
    borderRadius: R.full,
  },
  promoText: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    color: '#fff',
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
  gradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: 'transparent',
    // subtle bottom fade via overlay on content instead
  },
})
