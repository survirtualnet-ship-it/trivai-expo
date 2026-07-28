import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Navigation, Bookmark } from 'lucide-react-native'
import { ActionButton } from '@/components/ui/ActionButton'
import { T, F, S } from '@/lib/tokens'
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

function WhatsAppIcon() {
  return (
    <View style={styles.waIcon}>
      <Text style={styles.waText}>W</Text>
    </View>
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
      {showDirections && onDirections && (
        <ActionButton
          label="Cómo llegar"
          icon={<Navigation size={20} color="#fff" />}
          variant="primary"
          onPress={onDirections}
          accessibilityLabel="Cómo llegar"
        />
      )}
      {showWhatsApp && onWhatsApp && (
        <ActionButton
          label="WhatsApp"
          icon={<WhatsAppIcon />}
          variant="secondary"
          onPress={onWhatsApp}
          style={styles.waBtn}
          accessibilityLabel="Contactar por WhatsApp"
        />
      )}
      <ActionButton
        label={isFavorite ? 'Guardado' : 'Guardar'}
        icon={
          <Bookmark
            size={20}
            color={isFavorite ? T.primary : T.fg1}
            fill={isFavorite ? T.primary : 'transparent'}
          />
        }
        variant="secondary"
        onPress={onSave}
        loading={favoritePending}
        accessibilityLabel={isFavorite ? 'Quitar de guardados' : 'Guardar lugar'}
      />
    </View>
  )
})

const WA_GREEN = '#25D366'

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
    backgroundColor: T.surface,
  },
  waBtn: {
    backgroundColor: '#E8FBF0',
    borderColor: WA_GREEN,
  },
  waIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: WA_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#fff',
  },
})
