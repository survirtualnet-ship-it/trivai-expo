import type { ReactNode } from 'react'
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native'
import { T } from '@/lib/tokens'

const DESKTOP_MIN_WIDTH = 768

type Props = { children: ReactNode }

export function WebAppShell({ children }: Props) {
  const { width } = useWindowDimensions()
  const desktopWeb = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH

  if (!desktopWeb) return <>{children}</>

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: T.bg,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '80%',
    maxWidth: '80%',
  },
})
