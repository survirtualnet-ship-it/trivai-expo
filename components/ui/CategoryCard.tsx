import { memo, type ReactNode } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  type ImageSourcePropType,
} from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { CATEGORY_CARD_H, CATEGORY_CARD_W } from '@/lib/ui/styles'

type Props = {
  title: string
  icon?: ReactNode
  backgroundImage?: string | ImageSourcePropType | null
  backgroundColor?: string
  onPress?: () => void
  width?: number
  height?: number
}

export const CategoryCard = memo(function CategoryCard({
  title,
  icon,
  backgroundImage,
  backgroundColor = T.primary,
  onPress,
  width = CATEGORY_CARD_W,
  height = CATEGORY_CARD_H,
}: Props) {
  const content = (
    <>
      <View style={styles.overlay} />
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </>
  )

  const cardStyle = [styles.card, { width, height }]

  if (backgroundImage) {
    const source = typeof backgroundImage === 'string'
      ? { uri: backgroundImage }
      : backgroundImage

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.9}
      >
        <ImageBackground source={source} style={styles.fill} imageStyle={styles.image}>
          {content}
        </ImageBackground>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[cardStyle, { backgroundColor }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
    >
      {content}
    </TouchableOpacity>
  )
})

/** Category card from Trivai category metadata (emoji + color) */
export function CategoryCardFromMeta({
  title,
  emoji,
  color,
  onPress,
  backgroundImage,
}: {
  title: string
  emoji: string
  color: string
  onPress?: () => void
  backgroundImage?: string | null
}) {
  return (
    <CategoryCard
      title={title}
      icon={<Text style={styles.emoji}>{emoji}</Text>}
      backgroundColor={color}
      backgroundImage={backgroundImage}
      onPress={onPress}
    />
  )
}

export const CATEGORY_CARD_W_EXPORT = CATEGORY_CARD_W

const styles = StyleSheet.create({
  card: {
    borderRadius: R.xl,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  fill: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: S.md,
  },
  image: {
    borderRadius: R.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  iconWrap: {
    position: 'absolute',
    top: S.sm,
    right: S.sm,
  },
  emoji: {
    fontSize: 24,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: '#fff',
    zIndex: 1,
  },
})
