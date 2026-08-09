import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { profileTheme } from '../theme'

type Props = {
  categories: string[]
  savesCount: number
  viewsCount: number
  loading?: boolean
}

export const SmartProfile = memo(function SmartProfile({
  categories,
  savesCount,
  viewsCount,
  loading,
}: Props) {
  const hasSignal = categories.length > 0 || savesCount > 0 || viewsCount > 0

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(420).springify()} style={styles.card}>
      <Text style={styles.title}>Tu gusto</Text>
      <Text style={styles.subtitle}>
        Se arma solo con lo que explorás y guardás — sin inventar preferencias.
      </Text>

      {loading ? (
        <Text style={styles.empty}>Leyendo tu actividad…</Text>
      ) : !hasSignal ? (
        <Text style={styles.empty}>
          Todavía no hay señales. Guardá o visitá lugares y acá aparecen tus categorías.
        </Text>
      ) : (
        <>
          <View style={styles.metaGrid}>
            <MetaItem label="Guardados" value={String(savesCount)} />
            <MetaItem label="Explorados" value={String(viewsCount)} />
          </View>

          {categories.length > 0 ? (
            <>
              <Text style={styles.categoriesLabel}>Categorías que más te interesan</Text>
              <View style={styles.categories}>
                {categories.map(cat => (
                  <View key={cat} style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </Animated.View>
  )
})

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    marginTop: profileTheme.spacing.lg,
    padding: profileTheme.spacing.xl,
    backgroundColor: profileTheme.surface,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.md,
  },
  title: {
    color: profileTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: profileTheme.textSecondary,
    fontSize: 13,
    marginTop: -profileTheme.spacing.sm,
    lineHeight: 18,
  },
  empty: {
    color: profileTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: profileTheme.spacing.md,
  },
  metaItem: {
    flex: 1,
    padding: profileTheme.spacing.md,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.surfaceElevated,
    gap: profileTheme.spacing.xs,
  },
  metaLabel: {
    color: profileTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    color: profileTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  categoriesLabel: {
    color: profileTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: profileTheme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: profileTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(109,94,247,0.35)',
  },
  categoryText: {
    color: profileTheme.text,
    fontSize: 12,
    fontWeight: '600',
  },
})
