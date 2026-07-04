import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { T, F, S } from '@/lib/tokens'

type Props = {
  title: string
  actionLabel?: string
  actionIcon?: ReactNode
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, actionIcon, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          {actionIcon}
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.lg,
    marginTop: S.xxl + 4,
    marginBottom: S.md,
  },
  title: {
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: F.size.sm,
    color: T.purple,
    fontWeight: F.weight.semibold,
  },
})
