import { StyleSheet, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { CategoryChip } from '../../components/CategoryChip'
import { useOnboardingStore } from '../../store/onboardingStore'
import { onboardingTheme as t } from '../../lib/theme'
import { INTEREST_OPTIONS, type TouristInterestsProps } from '../types'

export function InterestsScreen({ navigation }: TouristInterestsProps) {
  const interests = useOnboardingStore(s => s.interests)
  const toggleInterest = useOnboardingStore(s => s.toggleInterest)

  return (
    <OnboardingLayout
      title="¿Qué te interesa?"
      subtitle="Selecciona todo lo que quieras explorar en tu viaje."
      footer={
        <PrimaryButton
          label="Continuar"
          disabled={interests.length === 0}
          onPress={() => navigation.navigate('TouristLocation')}
        />
      }
    >
      <View style={styles.grid}>
        {INTEREST_OPTIONS.map(item => (
          <CategoryChip
            key={item.id}
            label={item.label}
            emoji={item.emoji}
            selected={interests.includes(item.id)}
            onPress={() => toggleInterest(item.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.md,
    paddingTop: t.spacing.sm,
  },
})
