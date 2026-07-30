import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PrimaryButton } from '../components/PrimaryButton'
import { CardSelect } from '../components/CardSelect'
import { useOnboardingStore } from '../store/onboardingStore'
import { onboardingTheme as t } from '../lib/theme'
import type { UserTypeProps } from './types'

export function UserTypeScreen({ navigation }: UserTypeProps) {
  const setUserType = useOnboardingStore(s => s.setUserType)
  const [selected, setSelected] = useState<'tourist' | 'business' | null>(null)

  const handleContinue = () => {
    if (!selected) return
    setUserType(selected)
    if (selected === 'tourist') {
      navigation.navigate('TouristInterests')
    } else {
      navigation.navigate('BusinessGoogleLogin')
    }
  }

  return (
    <OnboardingLayout
      title="¿Cómo usarás Trivai?"
      subtitle="Elige tu experiencia. Puedes cambiar esto más adelante."
      footer={
        <PrimaryButton
          label="Continuar"
          disabled={!selected}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.list}>
        <CardSelect
          emoji="🧳"
          title="Soy Turista"
          subtitle="Descubre qué hacer ahora mismo en la ciudad."
          selected={selected === 'tourist'}
          onPress={() => setSelected('tourist')}
        />
        <CardSelect
          emoji="🏪"
          title="Soy Empresa"
          subtitle="Valida tu negocio con Google Maps y recibe turistas."
          selected={selected === 'business'}
          onPress={() => setSelected('business')}
        />
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: t.spacing.lg,
    paddingTop: t.spacing.md,
  },
})
