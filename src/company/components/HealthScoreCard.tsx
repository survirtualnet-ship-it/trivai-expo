import { View, Text, StyleSheet } from 'react-native'
import type { BusinessHealthScore } from '@/lib/domain/business-health'
import { formatHealthScoreDisplay } from '@/lib/domain/business-health'
import { T, F, S, R, SHADOW } from '@/lib/tokens'

const LEVEL_COLORS: Record<BusinessHealthScore['level'], string> = {
  excellent: T.green,
  good: T.purple,
  needs_improvement: T.orange,
  incomplete: T.danger,
}

type Props = {
  health: BusinessHealthScore
}

export function HealthScoreCard({ health }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Business Health</Text>
        <View style={[styles.levelPill, { backgroundColor: `${LEVEL_COLORS[health.level]}22` }]}>
          <Text style={[styles.levelText, { color: LEVEL_COLORS[health.level] }]}>
            {health.levelLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.score}>{formatHealthScoreDisplay(health)}</Text>

      <View style={styles.breakdown}>
        {health.dimensions.map(dim => (
          <View key={dim.id} style={styles.dimRow}>
            <Text style={styles.dimLabel}>{dim.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${dim.percent}%` }]} />
            </View>
            <Text style={styles.dimPct}>{dim.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.lg,
    borderWidth: 1,
    borderColor: T.border,
    gap: S.md,
    ...SHADOW.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: F.size.lg, fontWeight: '800', color: T.fg1 },
  levelPill: { paddingHorizontal: S.md, paddingVertical: 4, borderRadius: R.full },
  levelText: { fontSize: F.size.sm, fontWeight: '700' },
  score: { fontSize: 36, fontWeight: '800', color: T.fg1 },
  breakdown: { gap: S.sm },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  dimLabel: { width: 88, fontSize: F.size.sm, color: T.fg2, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: T.muted,
    borderRadius: R.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: T.purple, borderRadius: R.full },
  dimPct: { width: 40, textAlign: 'right', fontSize: F.size.sm, fontWeight: '700', color: T.fg1 },
})
