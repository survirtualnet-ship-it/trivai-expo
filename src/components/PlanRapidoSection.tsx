import { memo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { spacing } from '../theme'
import type { Locale, QuickPlan } from '../data/mock'
import { QuickPlanCard } from './QuickPlanCard'
import { SectionHeader } from './SectionHeader'

type Props = {
  title: string
  plans: QuickPlan[]
  locale: Locale
  onPressPlan?: (plan: QuickPlan) => void
}

export const PlanRapidoSection = memo(function PlanRapidoSection({
  title,
  plans,
  locale,
  onPressPlan,
}: Props) {
  if (plans.length === 0) return null

  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        style={styles.scroll}
        decelerationRate="fast"
        nestedScrollEnabled
      >
        {plans.map(plan => (
          <QuickPlanCard
            key={plan.id}
            plan={plan}
            locale={locale}
            onPress={() => onPressPlan?.(plan)}
          />
        ))}
      </ScrollView>
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxl,
  },
  scroll: {
    flexGrow: 0,
    overflow: 'visible',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
})
