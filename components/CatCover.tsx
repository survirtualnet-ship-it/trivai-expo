import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native'
import { getCatEmoji, getCatColor, normalizeCategory } from '@/lib/categories'
import { getCatImage } from '@/lib/catImages'

type Variant = 'thumb' | 'banner' | 'hero'

type Props = {
  category: string
  variant?: Variant
  style?: ViewStyle
  photoUri?: string | null
}

const HEIGHT: Record<Variant, number> = {
  thumb:  72,
  banner: 104,
  hero:   240,
}

export function CatCover({ category, variant = 'thumb', style, photoUri }: Props) {
  const cat = normalizeCategory(category)
  const color = getCatColor(category)
  const emoji = getCatEmoji(category)
  const catImg = getCatImage(cat)
  const source = photoUri ? { uri: photoUri } : catImg
  const height = (style as ViewStyle)?.height ?? HEIGHT[variant]

  if (source) {
    return (
      <View style={[styles.wrap, { height }, style]}>
        <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.overlay} />
      </View>
    )
  }

  return (
    <View
      style={[
        styles.wrap,
        styles.fallback,
        { height: (style as ViewStyle)?.height ?? HEIGHT[variant], backgroundColor: color + '28' },
        style,
      ]}
    >
      <Text style={{ fontSize: variant === 'hero' ? 64 : variant === 'banner' ? 36 : 28 }}>{emoji}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap:     { width: '100%', overflow: 'hidden', position: 'relative' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  overlay:  {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
})

export function CategoryPill({ category }: { category: string }) {
  const label = normalizeCategory(category)
  const color = getCatColor(category)
  return (
    <View style={[pillStyles.pill, { backgroundColor: color }]}>
      <Text style={pillStyles.text}>{label}</Text>
    </View>
  )
}

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
})
