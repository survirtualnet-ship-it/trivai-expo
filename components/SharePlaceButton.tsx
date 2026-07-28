import { TouchableOpacity, StyleSheet } from 'react-native'
import { Share2 } from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { sharePlace, type SharePlaceInput } from '@/lib/sharePlace'
import { T } from '@/lib/tokens'

type Props = {
  place: SharePlaceInput
  size?: number
  color?: string
}

export function SharePlaceButton({ place, size = 18, color = T.fg3 }: Props) {
  const { user } = useUser()

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => sharePlace(place, user?.id)}
      hitSlop={10}
      accessibilityLabel="Compartir lugar"
      accessibilityRole="button"
    >
      <Share2 size={size} color={color} strokeWidth={2} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
})
