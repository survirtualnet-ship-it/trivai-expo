import { memo } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { Search, SlidersHorizontal, MapPin } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  value: string
  onChangeText: (text: string) => void
  locationLabel: string
  onFilterPress?: () => void
  onLocationPress?: () => void
}

export const ExplorerSearchBar = memo(function ExplorerSearchBar({
  value,
  onChangeText,
  locationLabel,
  onFilterPress,
  onLocationPress,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Search size={18} color={T.fg3} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="¿Qué quieres descubrir?"
          placeholderTextColor={T.fg3}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={onFilterPress} hitSlop={8} style={styles.iconBtn}>
          <SlidersHorizontal size={18} color={T.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.location} onPress={onLocationPress} activeOpacity={0.85}>
        <MapPin size={14} color={T.primary} />
        <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    gap: S.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.92)',
    borderRadius: R.full,
    paddingHorizontal: S.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...SHADOW.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
    padding: 0,
  },
  iconBtn: {
    padding: 4,
  },
  location: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    maxWidth: '70%',
    ...SHADOW.sm,
  },
  locationText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.primary,
  },
})
