import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { StatCard } from '../components/StatCard'
import { SimpleBarChart } from '../components/SimpleBarChart'
import { companyTheme as t } from '../theme'
import type { DashboardStats } from '../types'

type Props = {
  stats: DashboardStats
}

export function DashboardTab({ stats }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Resumen del negocio</Text>
      <Text style={styles.subheading}>Últimos 7 días · Solo visible para el dueño</Text>

      <View style={styles.grid}>
        <StatCard label="Vistas" value={stats.views.toLocaleString()} hint="+12% vs semana anterior" />
        <StatCard
          label="Clicks"
          value={stats.clicks.toLocaleString()}
          hint="Llamadas, web y WhatsApp"
          accent={t.success}
        />
        <StatCard
          label="Guardados"
          value={stats.saves.toLocaleString()}
          hint="Usuarios que guardaron"
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
