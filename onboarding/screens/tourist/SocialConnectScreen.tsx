import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { onboardingTheme as t } from '../../lib/theme'
import type { TouristSocialProps } from '../types'

export function SocialConnectScreen({ navigation }: TouristSocialProps) {
  return (
    <OnboardingLayout
      title="Conecta con tus amigos"
      subtitle="Descubre qué están haciendo otros viajeros en la ciudad. (Mock por ahora)"
      footer={
        <>
          <PrimaryButton
            label="Continuar"
            onPress={() => navigation.navigate('TouristDone')}
          />
          <PrimaryButton
            label="Omitir este paso"
            variant="ghost"
            onPress={() => navigation.navigate('TouristDone')}
          />
        </>
      }
    >
      <View style={styles.list}>
        <SocialButton icon="logo-google" label="Continuar con Google" />
        <SocialButton icon="people" label="Importar contactos" />
        <Text style={styles.note}>
          Próximamente podrás ver planes de amigos y compartir los tuyos en tiempo real.
        </Text>
      </View>
    </OnboardingLayout>
  )
}

function SocialButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.btn}>
      <Ionicons name={icon} size={20} color={t.text} />
      <Text style={styles.btnLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: t.spacing.md,
    paddingTop: t.spacing.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 16,
  },
  btnLabel: {
    color: t.text,
    fontSize: t.font.body,
    fontWeight: '600',
  },
  note: {
    color: t.textMuted,
    fontSize: t.font.caption,
    lineHeight: 18,
    marginTop: t.spacing.sm,
  },
})
