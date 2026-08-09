import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MessageCircle } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  count: number
  onPress: () => void
}

/** Business-mode nudge when owner has unanswered reviews. */
export const OwnerPendingReviewsBanner = memo(function OwnerPendingReviewsBanner({
  count,
  onPress,
}: Props) {
  if (count <= 0) return null

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Responder reseñas pendientes"
    >
      <View style={styles.icon}>
        <MessageCircle size={18} color={T.surface} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>
          Tienes {count} {count === 1 ? 'reseña nueva' : 'reseñas nuevas'} por
          responder
        </Text>
        <Text style={styles.sub}>
          Una respuesta activa el loop: más confianza, más visitas.
        </Text>
      </View>
      <Text style={styles.cta}>Responder</Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.md,
    padding: S.lg,
    borderRadius: R.lg,
    backgroundColor: T.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  pressed: { opacity: 0.92 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.surface,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  cta: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    color: T.surface,
  },
})
