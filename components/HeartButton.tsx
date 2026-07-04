import { useState } from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { Heart } from 'lucide-react-native'
import { T } from '@/lib/tokens'

type Props = {
  /** true = círculo blanco flotante (sobre fotos); false = ícono plano */
  floating?: boolean
  size?: number
  initialActive?: boolean
  onToggle?: (active: boolean) => void
}

export function HeartButton({ floating = false, size = 18, initialActive = false, onToggle }: Props) {
  const [active, setActive] = useState(initialActive)

  const press = () => {
    const next = !active
    setActive(next)
    onToggle?.(next)
  }

  return (
    <TouchableOpacity
      style={floating ? styles.floating : styles.plain}
      onPress={press}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="Favorito"
      accessibilityRole="button"
    >
      <Heart
        size={size}
        color={active ? T.danger : floating ? T.fg1 : T.fg4}
        fill={active ? T.danger : 'none'}
        strokeWidth={1.75}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  floating: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  plain: {
    padding: 4,
  },
})
