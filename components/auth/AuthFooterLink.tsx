import { memo, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  prefix: string
  linkLabel: string
  onPress: () => void
  children?: ReactNode
}

export const AuthFooterLink = memo(function AuthFooterLink({
  prefix,
  linkLabel,
  onPress,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>{prefix}</Text>
      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={styles.link}>{linkLabel}</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: S.md,
    gap: S.xs,
  },
  prefix: {
    fontFamily: FONT.regular,
    fontSize: F.size.base,
    color: T.fg3,
  },
  link: {
    fontFamily: FONT.bold,
    fontSize: F.size.base,
    fontWeight: F.weight.bold,
    color: T.primary,
  },
})
