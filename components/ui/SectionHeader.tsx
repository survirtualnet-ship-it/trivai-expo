import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: ReactNode
}

export function SectionHeader({ title, actionLabel, onAction, actionIcon }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.8}>
          {actionIcon}
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    marginTop: S.xxl,
    marginBottom: S.md,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.3,
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.primary,
  },
})
