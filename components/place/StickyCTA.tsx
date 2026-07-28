import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    onPress()
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, S.md) }]}>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {isGo ? (
          <Navigation size={20} color="#fff" strokeWidth={2.4} />
        ) : (
          <MessageCircle size={20} color="#fff" strokeWidth={2.4} />
        )}
        <Text style={styles.label}>{label}</Text>
      </Pressable>
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
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
    backgroundColor: T.fg1,
    paddingVertical: 17,
    borderRadius: R.full,
    ...SHADOW.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    fontWeight: F.weight.semibold,
    color: '#fff',
    letterSpacing: -0.2,
  },
})
