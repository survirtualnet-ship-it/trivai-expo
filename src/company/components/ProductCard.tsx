import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Star, Trash2 } from 'lucide-react-native'
import { companyTheme as t } from '../theme'
import type { Product } from '../types'

type Props = {
  product: Product
  editMode?: boolean
  fullWidth?: boolean
  onPress?: () => void
  onDelete?: () => void
}

export const ProductCard = memo(function ProductCard({
  product,
  editMode,
  fullWidth,
  onPress,
  onDelete,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        fullWidth && styles.cardFull,
        pressed && onPress && styles.pressed,
      ]}
    >
      <Image source={{ uri: product.image }} style={styles.image} />
      {product.isFeatured ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Destacado</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>Bs. {product.price}</Text>
          {editMode && onDelete ? (
            <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
              <Trash2 size={16} color={t.warning} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
})

export const ProductCardCompact = memo(function ProductCardCompact({
  product,
}: {
  product: Product
}) {
  return (
    <View style={styles.compact}>
      <Image source={{ uri: product.image }} style={styles.compactImage} />
      <View style={styles.compactBody}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.ratingMini}>
          <Star size={12} color={t.star} fill={t.star} />
          <Text style={styles.price}>Bs. {product.price}</Text>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: t.border,
    marginRight: t.spacing.md,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardFull: {
    width: '100%',
    marginRight: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: t.surfaceMuted,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: t.spacing.md,
    gap: 2,
  },
  name: {
    color: t.text,
    fontSize: 14,
    fontWeight: '700',
  },
  category: {
    color: t.textMuted,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    color: t.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.surface,
    borderRadius: t.radius.md,
    padding: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: t.spacing.sm,
  },
  compactImage: {
    width: 56,
    height: 56,
    borderRadius: t.radius.sm,
    backgroundColor: t.surfaceMuted,
  },
  compactBody: {
    flex: 1,
    gap: 4,
  },
  ratingMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
})
