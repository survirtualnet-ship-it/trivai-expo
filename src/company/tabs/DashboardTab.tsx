import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { StatCard } from '../components/StatCard'
import { SimpleBarChart } from '../components/SimpleBarChart'
import { companyTheme as t } from '../theme'
import type { DashboardStats } from '../types'
import type { BusinessMetric } from '@/lib/analytics/types'

type Props = {
  stats: DashboardStats
  metrics?: BusinessMetric[]
}

function formatChangeHint(metrics: BusinessMetric[] | undefined, key: string): string {
  const m = metrics?.find(x => x.key === key)
  if (!m) return 'vs período anterior'
  const sign = m.changePercent >= 0 ? '+' : ''
  return `${sign}${m.changePercent}% vs período anterior`
}

export function DashboardTab({ stats, metrics }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Resumen del negocio</Text>
      <Text style={styles.subheading}>Datos reales · Solo visible para el dueño</Text>

      <View style={styles.grid}>
        <StatCard
          label="Vistas"
          value={stats.views.toLocaleString()}
          hint={formatChangeHint(metrics, 'views')}
        />
        <StatCard
          label="Clicks"
          value={stats.clicks.toLocaleString()}
          hint="WhatsApp, web, llamadas y rutas"
          accent={t.success}
        />
        <StatCard
          label="Guardados"
          value={stats.saves.toLocaleString()}
          hint={formatChangeHint(metrics, 'favorites')}
          accent={t.warning}
        />
        <StatCard
          label="Rating"
          value={stats.rating.toFixed(1)}
          hint="Promedio actual"
          accent={t.star}
        />
      </View>

      <SimpleBarChart values={stats.weeklyViews} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
  },
  heading: {
    color: t.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subheading: {
    color: t.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: t.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.md,
  },
})
