import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export const AuthErrorBanner = memo(function AuthErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  box: {
    backgroundColor: T.orangeSoft,
    borderWidth: 1,
    borderColor: T.orange,
    borderRadius: R.md,
    padding: S.md,
    marginBottom: S.md,
  },
  text: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: T.orange,
    fontWeight: F.weight.medium,
  },
})
