import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { companyTheme as t } from '../theme'

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

type Props = {
  values: number[]
  title?: string
}

export const SimpleBarChart = memo(function SimpleBarChart({
  values,
  title = 'Vistas esta semana',
}: Props) {
  const max = Math.max(...values, 1)

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {values.map((value, index) => {
          const heightPct = (value / max) * 100
          return (
            <View key={index} style={styles.col}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${heightPct}%` }]} />
              </View>
              <Text style={styles.day}>{DAYS[index] ?? ''}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.border,
    marginTop: t.spacing.lg,
  },
  title: {
    color: t.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: t.spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: t.spacing.sm,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: t.surfaceMuted,
    borderRadius: t.radius.sm,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    backgroundColor: t.accent,
    borderRadius: t.radius.sm,
    minHeight: 4,
  },
  day: {
    color: t.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
})
