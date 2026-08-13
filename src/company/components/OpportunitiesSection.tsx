import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import type { BusinessOpportunity } from '@/lib/domain/business-opportunities'
import { T, F, S, R, SHADOW } from '@/lib/tokens'

const PRIORITY_COLOR = {
  high: T.danger,
  medium: T.orange,
  low: T.fg3,
} as const

type Props = {
  opportunities: BusinessOpportunity[]
  placeId: string
}

export function OpportunitiesSection({ opportunities, placeId }: Props) {
  if (opportunities.length === 0) {
    return (
      <Text style={styles.empty}>
        ¡Excelente! No hay oportunidades pendientes por ahora.
      </Text>
    )
  }

  return (
    <View style={styles.list}>
      {opportunities.map(opp => (
        <View key={opp.id} style={styles.card}>
          <View style={styles.head}>
            <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[opp.priority] }]} />
            <Text style={styles.priority}>{opp.priorityLabel}</Text>
          </View>
          <Text style={styles.title}>{opp.title}</Text>
          <Text style={styles.description}>{opp.description}</Text>
          <Text style={styles.impact}>{opp.estimatedImpact}</Text>
          <Pressable
            style={styles.btn}
            onPress={() =>
              router.push((opp.deepLink ?? `/empresa/${placeId}`) as never)
            }
          >
            <Text style={styles.btnLabel}>{opp.action}</Text>
            <Feather name="arrow-right" size={16} color={T.purple} />
          </Pressable>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: S.sm },
  empty: { color: T.fg3, fontSize: F.size.md },
  card: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    gap: S.xs,
    ...SHADOW.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priority: { fontSize: F.size.xs, fontWeight: '700', color: T.fg3, textTransform: 'uppercase' },
  title: { fontSize: F.size.md, fontWeight: '800', color: T.fg1 },
  description: { fontSize: F.size.sm, color: T.fg2, lineHeight: 18 },
  impact: { fontSize: F.size.sm, color: T.purple, fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: S.xs,
    alignSelf: 'flex-start',
  },
  btnLabel: { color: T.purple, fontWeight: '700', fontSize: F.size.sm },
})
