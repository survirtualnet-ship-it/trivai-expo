import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { PlaceLifeBadge } from '@/lib/reviews'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  badges: PlaceLifeBadge[]
}

export const PlaceLifeBadges = memo(function PlaceLifeBadges({ badges }: Props) {
  if (!badges.length) return null

  return (
    <View style={styles.wrap} accessibilityRole="text">
      {badges.map(b => (
        <View
          key={b.id}
          style={[
            styles.badge,
            b.id === 'nuevo' && styles.nuevo,
            b.id === 'negocio_activo' && styles.activo,
            b.id === 'responde_rapido' && styles.rapido,
          ]}
        >
          <Text style={styles.label}>{b.label}</Text>
        </View>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingBottom: S.sm,
    backgroundColor: T.surface,
  },
  badge: {
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    borderWidth: 1,
  },
  nuevo: {
    backgroundColor: T.orangeSoft,
    borderColor: T.accent,
  },
  activo: {
    backgroundColor: T.greenSoft,
    borderColor: T.greenInk,
  },
  rapido: {
    backgroundColor: T.purpleSoft,
    borderColor: T.primary,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.fg1,
  },
})
