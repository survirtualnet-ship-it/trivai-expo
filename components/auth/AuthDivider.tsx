import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export const AuthDivider = memo(function AuthDivider({ label = 'o' }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginVertical: S.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: T.fg4,
  },
})
