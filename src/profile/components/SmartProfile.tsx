import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { profileTheme } from '../theme'
import {
  budgetLabel,
  preferredTimeLabel,
  useProfileStore,
} from '../store/useProfileStore'

export const SmartProfile = memo(function SmartProfile() {
  const preferences = useProfileStore(s => s.preferences)

  return (
    <Animated.View entering={FadeInDown.delay(80).duration(420).springify()} style={styles.card}>
      <Text style={styles.title}>Perfil inteligente</Text>
      <Text style={styles.subtitle}>Insights basados en tu comportamiento</Text>

      <View style={styles.tags}>
        {preferences.smartTags.map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaGrid}>
        <MetaItem label="Presupuesto" value={budgetLabel(preferences.budgetLevel)} />
        <MetaItem label="Horario favorito" value={preferredTimeLabel(preferences.preferredTime)} />
      </View>

      <Text style={styles.categoriesLabel}>Categorías favoritas</Text>
      <View style={styles.categories}>
        {preferences.favoriteCategories.map(cat => (
          <View key={cat} style={styles.categoryChip}>
            <Text style={styles.categoryText}>{cat}</Text>
          </View>
        ))}
      </View>
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
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: profileTheme.spacing.sm,
  },
  tag: {
    paddingHorizontal: profileTheme.spacing.md,
    paddingVertical: 8,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(109,94,247,0.35)',
  },
  tagText: {
    color: profileTheme.text,
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: profileTheme.surfaceElevated,
    borderWidth: 1,
    borderColor: profileTheme.border,
  },
  categoryText: {
    color: profileTheme.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
})
