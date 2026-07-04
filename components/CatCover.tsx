import { View, Text, Image, StyleSheet, type ViewStyle } from 'react-native'
import { getCatEmoji, getCatColor, normalizeCategory } from '@/lib/categories'
import { getCatImage } from '@/lib/catImages'

type Props = {
  category: string
  variant?: 'icon' | 'hero'
  style?: ViewStyle
}

export function CatCover({ category, variant = 'icon', style }: Props) {
  const cat = normalizeCategory(category)
  const color = getCatColor(category)
  const emoji = getCatEmoji(category)
  const img = getCatImage(cat)
  const isHero = variant === 'hero'

  if (img) {
    return (
      <Image
        source={img}
        style={[isHero ? styles.hero : styles.icon, style]}
        resizeMode="cover"
      />
    )
  }

  return (
    <View
      style={[
        isHero ? styles.heroFallback : styles.iconFallback,
        { backgroundColor: color + (isHero ? '33' : '22') },
        style,
      ]}
    >
      <Text style={{ fontSize: isHero ? 72 : 24 }}>{emoji}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  icon:         { width: '100%', height: '100%' },
  iconFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  hero:         { width: '100%', height: 220 },
  heroFallback: { width: '100%', height: 220, alignItems: 'center', justifyContent: 'center' },
})
