import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Store, Sparkles } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { companyTheme as t } from '../theme'

export const MyBusinessEmptyScreen = memo(function MyBusinessEmptyScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Store size={32} color={t.accent} />
        </View>
        <Text style={styles.title}>Aún no tienes un negocio</Text>
        <Text style={styles.subtitle}>
        Registra otro local o reclama uno nuevo en Trivai para aparecer en el mapa,
          responder reseñas y ver estadísticas.
        </Text>

        <View style={styles.featureList}>
          <FeatureRow icon="📍" text="Aparece en el mapa de descubrimiento" />
          <FeatureRow icon="📊" text="Dashboard con vistas y clics" />
          <FeatureRow icon="⭐" text="Responde reseñas de clientes" />
        </View>

        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            router.push('/empresa/onboarding')
          }}
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
        >
          <Sparkles size={18} color="#fff" />
          <Text style={styles.primaryLabel}>Reclamar un negocio</Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
        >
          <Text style={styles.ghostLabel}>Volver al perfil</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
})

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: t.spacing.xxl,
    justifyContent: 'center',
    gap: t.spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: t.radius.xl,
    backgroundColor: t.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    color: t.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  featureList: {
    gap: t.spacing.sm,
    marginVertical: t.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.surface,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
    borderWidth: 1,
    borderColor: t.border,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureText: {
    flex: 1,
    color: t.textSecondary,
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingVertical: 14,
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghostBtn: {
    alignItems: 'center',
    paddingVertical: t.spacing.md,
  },
  ghostLabel: {
    color: t.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
})
