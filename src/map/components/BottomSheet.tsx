import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import GorhomBottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { mapTheme } from '../theme'
import type { MapPlace } from '../store/useMapStore'

type Props = {
  place: MapPlace | undefined
  distance: string
  open: boolean
  onClose: () => void
}

export const PlaceDetailBottomSheet = memo(function PlaceDetailBottomSheet({
  place,
  distance,
  open,
  onClose,
}: Props) {
  const sheetRef = useRef<GorhomBottomSheet>(null)
  const snapPoints = useMemo(() => ['48%', '88%'], [])

  useEffect(() => {
    if (open && place) {
      sheetRef.current?.snapToIndex(0)
    } else {
      sheetRef.current?.close()
    }
  }, [open, place])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  if (!place) return null

  return (
    <GorhomBottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: place.imageUrl }} style={styles.hero} />
        <View style={styles.body}>
          <Text style={styles.category}>{place.category}</Text>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.meta}>
            ★ {place.rating.toFixed(1)} · {distance}
          </Text>
          <Text style={styles.description}>{place.description}</Text>

          <Pressable
            onPress={() => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>Reservar / Ir ahora</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </GorhomBottomSheet>
  )
})

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: mapTheme.surface,
    borderTopLeftRadius: mapTheme.radius.lg,
    borderTopRightRadius: mapTheme.radius.lg,
  },
  handle: {
    backgroundColor: mapTheme.textMuted,
    width: 40,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    width: '100%',
    height: 200,
    backgroundColor: mapTheme.surfaceElevated,
  },
  body: {
    padding: mapTheme.spacing.xl,
    gap: mapTheme.spacing.sm,
  },
  category: {
    color: mapTheme.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  name: {
    color: mapTheme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  meta: {
    color: mapTheme.textSecondary,
    fontSize: 14,
  },
  description: {
    color: mapTheme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: mapTheme.spacing.sm,
  },
  cta: {
    marginTop: mapTheme.spacing.lg,
    backgroundColor: mapTheme.accent,
    borderRadius: mapTheme.radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
