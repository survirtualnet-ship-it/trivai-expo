import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Location from 'expo-location'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { ONBOARDING_CONFIG } from '../../lib/config'
import { onboardingTheme as t } from '../../lib/theme'
import type { TouristLocationProps } from '../types'

export function LocationScreen({ navigation }: TouristLocationProps) {
  const setLocation = useOnboardingStore(s => s.setLocation)
  const [loading, setLoading] = useState(false)
  const [manualCity, setManualCity] = useState('')
  const [error, setError] = useState<string | null>(null)

  const useGps = async () => {
    setLoading(true)
    setError(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Puedes activar ubicación después desde ajustes.')
        return
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: 'Mi ubicación actual',
      })
      useProfileStore.getState().setUser({ locationPermission: true })
      navigation.navigate('TouristSocial')
    } catch {
      setError('No pudimos obtener tu ubicación. Prueba ingresar la ciudad manualmente.')
    } finally {
      setLoading(false)
    }
  }

  const useManual = () => {
    const city = manualCity.trim() || ONBOARDING_CONFIG.defaultCity
    setLocation({
      lat: -17.7833,
      lng: -63.1821,
      label: city,
    })
    navigation.navigate('TouristSocial')
  }

  const skip = () => {
    Alert.alert(
      'Continuar sin ubicación',
      'Podrás activarla más tarde desde ajustes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            setLocation(null)
            navigation.navigate('TouristSocial')
          },
        },
      ],
    )
  }

  return (
    <OnboardingLayout
      title="¿Dónde estás?"
      subtitle="Usamos tu ubicación para sugerirte planes cerca, en este momento."
      footer={
        <>
          <PrimaryButton
            label="Usar mi ubicación"
            loading={loading}
            onPress={useGps}
          />
          <PrimaryButton
            label="Continuar con ciudad manual"
            variant="secondary"
            onPress={useManual}
          />
          <PrimaryButton label="Omitir por ahora" variant="ghost" onPress={skip} />
        </>
      }
    >
      <View style={styles.box}>
        <Text style={styles.label}>Ciudad (opcional)</Text>
        <TextInput
          value={manualCity}
          onChangeText={setManualCity}
          placeholder={ONBOARDING_CONFIG.defaultCity}
          placeholderTextColor={t.textMuted}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  box: {
    gap: t.spacing.sm,
    paddingTop: t.spacing.md,
  },
  label: {
    color: t.textSecondary,
    fontSize: t.font.caption,
    fontWeight: '600',
  },
  input: {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 14,
    color: t.text,
    fontSize: t.font.body,
  },
  error: {
    color: t.accentSecondary,
    fontSize: t.font.caption,
    lineHeight: 18,
    marginTop: t.spacing.sm,
  },
})
