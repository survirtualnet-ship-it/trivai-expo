import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import { profileTheme } from '../theme'

type Props = {
  zone: string | null
  city: string | null
  permissionDenied?: boolean
}

export const StatusCard = memo(function StatusCard({
  zone,
  city,
  permissionDenied,
}: Props) {
  const placeLabel = zone?.trim() || city?.trim() || null

  return (
    <Animated.View entering={FadeInDown.delay(120).duration(420).springify()} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>📍</Text>
        <View style={styles.body}>
          <Text style={styles.label}>Tu ubicación</Text>
          <Text style={styles.zone}>
            {placeLabel || (permissionDenied ? 'Ubicación desactivada' : 'Detectando…')}
          </Text>
        </View>
      </View>
      {!placeLabel ? (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>Tip</Text>
          <Text style={styles.suggestion}>
            {permissionDenied
              ? 'Activá la ubicación para recomendaciones cerca tuyo.'
              : 'Cuando tengamos GPS o ciudad, lo mostramos acá — sin inventar barrios.'}
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/mapa')} style={styles.linkBtn}>
            <Text style={styles.linkText}>Abrir mapa</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>Cerca tuyo</Text>
          <Text style={styles.suggestion}>
            Explorá el mapa o Inicio para ver lugares reales en esta zona.
          </Text>
        </View>
      )}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    marginTop: profileTheme.spacing.lg,
    padding: profileTheme.spacing.xl,
    backgroundColor: profileTheme.surfaceElevated,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: profileTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  zone: {
    color: profileTheme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  suggestionBox: {
    padding: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(109,94,247,0.3)',
    gap: profileTheme.spacing.xs,
  },
  suggestionLabel: {
    color: profileTheme.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestion: {
    color: profileTheme.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  linkBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  linkText: {
    color: profileTheme.accent,
    fontSize: 14,
    fontWeight: '700',
  },
})
