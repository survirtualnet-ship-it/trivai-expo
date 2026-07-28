import { memo, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export type SettingsRow = {
  key: string
  label: string
  icon?: ReactNode
  iconBg?: string
  onPress: () => void
  value?: string
  destructive?: boolean
}

type GroupProps = {
  rows: SettingsRow[]
  footer?: string
}

/** iOS Settings–style grouped list */
export const SettingsGroup = memo(function SettingsGroup({ rows, footer }: GroupProps) {
  if (!rows.length) return null

  return (
    <View style={styles.block}>
      <View style={styles.group}>
        {rows.map((row, i) => (
          <Pressable
            key={row.key}
            onPress={row.onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={row.label}
          >
            {row.icon && row.iconBg ? (
              <View style={[styles.iconWrap, { backgroundColor: row.iconBg }]}>
                {row.icon}
              </View>
            ) : null}

            <View
              style={[
                styles.rowBody,
                !row.icon && styles.rowBodyFull,
                i < rows.length - 1 && styles.rowBorder,
                row.destructive && styles.rowBodyCenter,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  row.destructive && styles.destructive,
                ]}
              >
                {row.label}
              </Text>
              {!row.destructive && row.value ? (
                <Text style={styles.value}>{row.value}</Text>
              ) : null}
              {!row.destructive ? (
                <ChevronRight size={18} color={T.fg4} strokeWidth={2} />
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  )
})

/** @deprecated Use SettingsGroup */
export const ProfileOptions = SettingsGroup

const styles = StyleSheet.create({
  block: {
    marginBottom: S.xl,
  },
  group: {
    marginHorizontal: S.lg,
    backgroundColor: T.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingLeft: S.md,
  },
  pressed: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    minHeight: 48,
    marginLeft: S.md,
    paddingRight: S.md,
  },
  rowBodyFull: {
    marginLeft: 0,
    paddingLeft: S.md,
  },
  rowBodyCenter: {
    justifyContent: 'center',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  label: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  value: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
  destructive: {
    color: T.danger,
    textAlign: 'center',
    flex: 0,
  },
  footer: {
    marginTop: S.sm,
    marginHorizontal: S.xl,
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
    lineHeight: 16,
  },
})
