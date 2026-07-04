import { View, Text, StyleSheet, Image } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const COLORS = [T.purpleSoft, T.orangeSoft, T.greenSoft, T.muted]
const INK = [T.primary, T.accent, T.secondary, T.fg2]

export type AvatarItem = {
  id: string
  initials: string
  avatarUrl?: string | null
}

type Props = {
  items: AvatarItem[]
  max?: number
  size?: number
  showOverflow?: boolean
}

export function AvatarGroup({ items, max = 4, size = 28, showOverflow = true }: Props) {
  const visible = items.slice(0, max)
  const extra = items.length - visible.length

  return (
    <View style={styles.row}>
      {visible.map((item, i) => (
        <View
          key={item.id}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: i === 0 ? 0 : -size * 0.28,
              zIndex: visible.length - i,
              backgroundColor: COLORS[i % COLORS.length],
            },
          ]}
        >
          {item.avatarUrl
            ? <Image source={{ uri: item.avatarUrl }} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} />
            : <Text style={[styles.ini, { fontSize: size * 0.32, color: INK[i % INK.length] }]}>{item.initials}</Text>}
        </View>
      ))}
      {showOverflow && extra > 0 && (
        <View style={[styles.avatar, styles.overflow, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.28 }]}>
          <Text style={[styles.ini, { fontSize: size * 0.28, color: T.fg3 }]}>+{extra}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.surface,
    overflow: 'hidden',
  },
  overflow: {
    backgroundColor: T.muted,
  },
  ini: {
    fontFamily: FONT.bold,
    fontWeight: F.weight.bold,
  },
})
