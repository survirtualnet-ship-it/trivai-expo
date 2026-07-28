import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Navigation, MessageCircle } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  mode: 'go' | 'contact'
  onPress: () => void
}

export const StickyCTA = memo(function StickyCTA({ mode, onPress }: Props) {
  const insets = useSafeAreaInsets()
  const isGo = mode === 'go'
  const label = isGo ? 'Ir ahora' : 'Contactar'

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    onPress()
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, S.md) }]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={handlePress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {isGo ? (
          <Navigation size={22} color="#fff" />
        ) : (
          <MessageCircle size={22} color="#fff" />
        )}
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: T.border,
    ...SHADOW.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: T.primary,
    paddingVertical: 18,
    borderRadius: R.xl,
    ...SHADOW.md,
  },
  label: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: '#fff',
    letterSpacing: 0.2,
  },
})
