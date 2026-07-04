import { Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { T, F } from '@/lib/tokens'
import { TrivaiHeader } from '@/components/TrivaiHeader'

type Props = {
  title: string
  fallbackHref?: string
  right?: ReactNode
  /** Acción personalizada para el botón Volver (por defecto: router.back) */
  onBack?: () => void
}

export function goBack(fallbackHref = '/(tabs)/perfil') {
  if (router.canGoBack()) router.back()
  else router.replace(fallbackHref as any)
}

export default function ScreenHeader({ title, fallbackHref, right, onBack }: Props) {
  return (
    <TrivaiHeader
      title={title}
      left={
        <TouchableOpacity
          style={styles.back}
          onPress={onBack ?? (() => goBack(fallbackHref))}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={T.purple} strokeWidth={2.25} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      }
      right={right}
    />
  )
}

const styles = StyleSheet.create({
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.purple,
  },
})
