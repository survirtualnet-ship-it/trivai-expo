import { memo, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Navigation, Bookmark, MessageCircle } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  isFavorite: boolean
  favoritePending?: boolean
  showWhatsApp?: boolean
  showDirections?: boolean
  onDirections?: () => void
  onWhatsApp?: () => void
  onSave: () => void
}

function ActionItem({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string
  icon: ReactNode
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPress()
      }}
      disabled={disabled}
      style={({ pressed }) => [styles.item, pressed && styles.pressed, disabled && styles.disabled]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconCircle}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

export const ActionBar = memo(function ActionBar({
  isFavorite,
  favoritePending,
  showWhatsApp = true,
  showDirections = true,
  onDirections,
  onWhatsApp,
  onSave,
}: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="toolbar">
      {showDirections && onDirections ? (
        <ActionItem
          label="Cómo llegar"
          icon={<Navigation size={20} color={T.fg1} strokeWidth={2.2} />}
          onPress={onDirections}
        />
      ) : null}

      {showWhatsApp && onWhatsApp ? (
        <ActionItem
          label="WhatsApp"
          icon={<MessageCircle size={20} color={T.fg1} strokeWidth={2.2} />}
          onPress={onWhatsApp}
        />
      ) : null}

      <ActionItem
        label={isFavorite ? 'Guardado' : 'Guardar'}
        icon={(
          <Bookmark
            size={20}
            color={isFavorite ? T.primary : T.fg1}
            fill={isFavorite ? T.primary : 'transparent'}
            strokeWidth={2.2}
          />
        )}
        onPress={onSave}
        disabled={favoritePending}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xxl,
    backgroundColor: T.surface,
  },
  item: {
    alignItems: 'center',
    gap: S.sm,
    minWidth: 88,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg2,
  },
})
