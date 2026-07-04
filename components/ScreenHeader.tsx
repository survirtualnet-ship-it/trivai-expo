import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { T, F, S } from '@/lib/tokens'

type Props = {
  title: string
  fallbackHref?: string
  right?: ReactNode
}

export function goBack(fallbackHref = '/(tabs)/perfil') {
  if (router.canGoBack()) router.back()
  else router.replace(fallbackHref as any)
}

export default function ScreenHeader({ title, fallbackHref, right }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => goBack(fallbackHref)}
        accessibilityLabel="Volver"
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={22} color={T.purple} strokeWidth={2.25} />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.surface,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 88,
  },
  backText: {
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.purple,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
    marginHorizontal: S.sm,
  },
  spacer: { width: 88 },
})
