import { memo, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export type SectionHeaderProps = {
  title: string
  actionLabel?: string
  onAction?: () => void
  subtitle?: string
  size?: 'lg' | 'md'
  style?: StyleProp<ViewStyle>
}

export const SectionHeader = memo(function SectionHeader({
  title,
  actionLabel,
  onAction,
  subtitle,
  size = 'lg',
  style,
}: SectionHeaderProps) {
  const isMd = size === 'md'

  return (
    <View style={[styles.header, isMd && styles.headerMd, style]}>
      <View style={styles.titleCol}>
        <Text style={[styles.title, isMd && styles.titleMd]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8} activeOpacity={0.8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

export type SectionProps = SectionHeaderProps & {
  children: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}

export const Section = memo(function Section({
  title,
  actionLabel,
  onAction,
  subtitle,
  size,
  style,
  contentStyle,
  children,
}: SectionProps) {
  return (
    <View style={[styles.wrap, style]}>
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        onAction={onAction}
        subtitle={subtitle}
        size={size}
      />
      <View style={contentStyle}>{children}</View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginBottom: S.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    marginBottom: S.md,
    gap: S.sm,
  },
  headerMd: {
    paddingHorizontal: 0,
    marginBottom: S.sm,
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.4,
  },
  titleMd: {
    fontSize: F.size.lg,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 2,
  },
  action: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg3,
  },
})
