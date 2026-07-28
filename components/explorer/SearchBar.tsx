import { memo } from 'react'
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Text,
} from 'react-native'
import { Search, MapPin, X } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  value: string
  onChangeText: (text: string) => void
  locationLabel: string
  onLocationPress?: () => void
}

export const ExplorerSearchBar = memo(function ExplorerSearchBar({
  value,
  onChangeText,
  locationLabel,
  onLocationPress,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Search size={17} color={T.fg3} strokeWidth={2.2} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar lugares"
          placeholderTextColor={T.fg4}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={10}
            accessibilityLabel="Limpiar búsqueda"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <X size={16} color={T.fg3} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={onLocationPress}
        style={({ pressed }) => [styles.location, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Ubicación: ${locationLabel}`}
      >
        <MapPin size={13} color={T.fg2} strokeWidth={2.2} />
        <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    gap: S.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.96)' : '#FFFFFF',
    borderRadius: R.full,
    paddingHorizontal: S.lg,
    minHeight: 48,
    ...SHADOW.md,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  location: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: S.md,
    paddingVertical: 7,
    borderRadius: R.full,
    maxWidth: '72%',
    ...SHADOW.sm,
  },
  locationText: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg2,
  },
  pressed: {
    opacity: 0.85,
  },
})
