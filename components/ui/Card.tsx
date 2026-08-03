import { memo, type ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { T, S, R, SHADOW } from '@/lib/tokens'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const Card = memo(function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.xl,
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
})
