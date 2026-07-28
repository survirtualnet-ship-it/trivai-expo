import { memo, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Bookmark, MapPinned } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  savedPlaces: number
  visits: number
  onSavedPress?: () => void
}

export const ProfileStats = memo(function ProfileStats({
  savedPlaces,
  visits,
  onSavedPress,
}: Props) {
  return (
    <View style={styles.row}>
      <StatCard
        icon={<Bookmark size={18} color={T.primary} />}
        value={savedPlaces}
        label="Guardados"
        onPress={onSavedPress}
      />
      <View style={styles.divider} />
      <StatCard
        icon={<MapPinned size={18} color={T.fg3} />}
        value={visits}
        label="Visitas"
        subtitle="Pronto"
        disabled
      />
    </View>
  )
})

function StatCard({
  icon,
  value,
  label,
  subtitle,
  onPress,
  disabled,
}: {
  icon: ReactNode
  value: number
  label: string
  subtitle?: string
  onPress?: () => void
  disabled?: boolean
}) {
  const content = (
    <>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </>
  )

  const a11y = `${label}: ${value}${subtitle ? `, ${subtitle}` : ''}`

  if (disabled || !onPress) {
    return (
      <View style={[styles.card, disabled && styles.cardMuted]} accessibilityLabel={a11y}>
        {content}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: S.lg,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: S.lg,
    paddingHorizontal: S.sm,
    gap: 4,
  },
  cardMuted: {
    opacity: 0.72,
  },
  divider: {
    width: 1,
    backgroundColor: T.border,
    marginVertical: S.md,
  },
  iconWrap: {
    marginBottom: 2,
  },
  value: {
    fontFamily: FONT.bold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  label: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT.semibold,
    fontSize: 10,
    color: T.fg4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
})
