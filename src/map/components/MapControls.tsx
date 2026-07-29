import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { mapTheme } from '../theme'

type Props = {
  onCenterUser: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFilters: () => void
  filtersVisible: boolean
}

export const MapControls = memo(function MapControls({
  onCenterUser,
  onZoomIn,
  onZoomOut,
  onToggleFilters,
  filtersVisible,
}: Props) {
  return (
    <View style={styles.col}>
      <ControlButton label="◎" onPress={onCenterUser} accessibilityLabel="Centrar en mi ubicación" />
      <ControlButton label="+" onPress={onZoomIn} accessibilityLabel="Acercar" />
      <ControlButton label="−" onPress={onZoomOut} accessibilityLabel="Alejar" />
      <ControlButton
        label="☰"
        onPress={onToggleFilters}
        active={filtersVisible}
        accessibilityLabel="Filtros"
      />
    </View>
  )
})

function ControlButton({
  label,
  onPress,
  active,
  accessibilityLabel,
}: {
  label: string
  onPress: () => void
  active?: boolean
  accessibilityLabel: string
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  col: {
    gap: mapTheme.spacing.sm,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: mapTheme.radius.md,
    backgroundColor: mapTheme.surface,
    borderWidth: 1,
    borderColor: mapTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: mapTheme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  btnActive: {
    backgroundColor: mapTheme.accentSoft,
    borderColor: mapTheme.accent,
  },
  label: {
    color: mapTheme.text,
    fontSize: 20,
    fontWeight: '600',
  },
  labelActive: {
    color: mapTheme.accent,
  },
  pressed: {
    opacity: 0.85,
  },
})
