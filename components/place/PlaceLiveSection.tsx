import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Clock, Users, Sparkles } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceLiveContent } from '@/lib/places/types'

type Props = {
  live: PlaceLiveContent | null
  claimed: boolean
}

const CROWD_LABELS: Record<string, string> = {
  low: 'Poca gente ahora',
  medium: 'Moderado',
  high: 'Muy concurrido',
}

export const PlaceLiveSection = memo(function PlaceLiveSection({
  live,
  claimed,
}: Props) {
  const hasTips = (live?.tips?.length ?? 0) > 0
  const hasBestTime = !!live?.best_time_tip
  const hasCrowd = !!live?.crowd_level

  if (!claimed && !hasTips && !hasBestTime && !hasCrowd) return null

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Sparkles size={18} color={T.primary} />
        <Text style={styles.title}>Perfil vivo</Text>
        {claimed ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verificado</Text>
          </View>
        ) : null}
      </View>

      {hasBestTime ? (
        <View style={styles.row}>
          <Clock size={16} color={T.fg3} />
          <View style={styles.rowBody}>
            <Text style={styles.label}>Mejor hora para ir</Text>
            <Text style={styles.value}>{live!.best_time_tip}</Text>
          </View>
        </View>
      ) : null}

      {hasCrowd ? (
        <View style={styles.row}>
          <Users size={16} color={T.fg3} />
          <View style={styles.rowBody}>
            <Text style={styles.label}>Nivel de gente</Text>
            <Text style={styles.value}>
              {CROWD_LABELS[live!.crowd_level!] ?? live!.crowd_level}
            </Text>
          </View>
        </View>
      ) : null}

      {hasTips ? (
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips recientes</Text>
          {live!.tips.slice(0, 3).map(tip => (
            <Text key={tip.id} style={styles.tipText}>
              · {tip.text}
            </Text>
          ))}
        </View>
      ) : null}

      {!hasBestTime && !hasCrowd && !hasTips && claimed ? (
        <Text style={styles.empty}>
          El negocio puede agregar tips y horarios recomendados desde su panel.
        </Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.md,
    padding: S.lg,
    backgroundColor: T.purpleSoft,
    borderRadius: R.lg,
    gap: S.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  badge: {
    backgroundColor: T.primary,
    paddingHorizontal: S.sm,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  badgeText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.surface,
  },
  row: {
    flexDirection: 'row',
    gap: S.md,
    alignItems: 'flex-start',
  },
  rowBody: { flex: 1 },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg2,
  },
  value: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
    marginTop: 2,
    lineHeight: 20,
  },
  tips: { gap: 6 },
  tipsTitle: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg2,
  },
  tipText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
    lineHeight: 20,
  },
  empty: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    lineHeight: 20,
  },
})
