import { memo, useCallback } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { H, homeShadow } from '@/lib/home/theme'
import type { EmergencyItem, HomeLocale } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  items: EmergencyItem[]
  locale: HomeLocale
  onPressItem: (item: EmergencyItem) => void
}

export const EmergencySection = memo(function EmergencySection({
  title,
  items,
  locale,
  onPressItem,
}: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<EmergencyItem>) => {
      const label = locale === 'EN' ? item.labelEn : item.labelEs
      const subtitle = locale === 'EN' ? item.subtitleEn : item.subtitleEs
      return (
        <Pressable
          onPress={() => onPressItem(item)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={styles.copy}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <ChevronRight size={18} color={H.emergencyAccent} strokeWidth={2.2} />
        </Pressable>
      )
    },
    [locale, onPressItem],
  )

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        style={styles.listRoot}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  section: {
    marginTop: H.sectionGap,
    paddingHorizontal: H.padX,
    gap: 14,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 20,
    fontWeight: '600',
    color: H.text,
    letterSpacing: -0.3,
  },
  listRoot: {
    flexGrow: 0,
  },
  list: {
    gap: 10,
  },
  card: {
    minHeight: 80,
    borderRadius: H.radius,
    backgroundColor: H.emergencyBg,
    borderWidth: 1,
    borderColor: H.emergencyBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...homeShadow.soft,
  },
  emoji: {
    fontSize: 28,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: H.text,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: H.textSecondary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
})
