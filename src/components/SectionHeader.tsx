import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight } from '../theme'

type Props = {
  title: string
  onPressArrow?: () => void
  showArrow?: boolean
}

export const SectionHeader = memo(function SectionHeader({
  title,
  onPressArrow,
  showArrow = true,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {showArrow ? (
        <Pressable
          onPress={onPressArrow}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${title} ver más`}
          style={({ pressed }) => [styles.arrowBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.section,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
})
