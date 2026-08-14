import { memo } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Search, X } from 'lucide-react-native'
import { FONT } from '@/lib/typography'
import { T, S, R, icons } from '@/src/design'

type Props = {
  locationLabel: string
  weatherLabel: string
  search: string
  onSearchChange: (text: string) => void
  onSearchSubmit?: () => void
}

export const ExploreHeader = memo(function ExploreHeader({
  locationLabel,
  weatherLabel,
  search,
  onSearchChange,
  onSearchSubmit,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.metaRow}>
        <Text style={styles.location} numberOfLines={1}>{locationLabel}</Text>
        <Text style={styles.weather}>{weatherLabel}</Text>
      </View>

      <View style={styles.search}>
        <Search size={icons.size.sm + 1} color={T.fg2} strokeWidth={icons.stroke.default} />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search places"
          placeholderTextColor={T.fg3}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={onSearchSubmit}
          clearButtonMode="never"
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => onSearchChange('')}
            hitSlop={10}
            accessibilityLabel="Clear search"
          >
            <X size={icons.size.sm} color={T.fg2} strokeWidth={icons.stroke.default} />
          </Pressable>
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.md,
    gap: S.md,
    backgroundColor: T.surface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
  },
  location: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 17,
    fontWeight: '600',
    color: T.fg1,
    letterSpacing: -0.3,
  },
  weather: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: T.fg2,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: T.muted,
    borderRadius: R.lg,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: T.fg1,
    paddingVertical: 10,
  },
})
