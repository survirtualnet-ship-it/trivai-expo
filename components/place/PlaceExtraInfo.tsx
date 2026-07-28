import { memo } from 'react'
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native'
import { MapPin } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Tag } from '@/components/ui/Tag'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceDetail } from '@/lib/placeDetail'

type Props = {
  place: PlaceDetail
}

export const PlaceExtraInfo = memo(function PlaceExtraInfo({ place }: Props) {
  const hasHours = place.openingHours.length > 0
  const hasServices = !!place.servicesLabel
  const hasAddress = !!place.address?.trim()

  if (!hasHours && !hasServices && !hasAddress) return null

  const openServices = () => {
    if (!place.servicesUrl) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    Linking.openURL(place.servicesUrl)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Información</Text>

      {hasAddress && (
        <View style={styles.row}>
          <MapPin size={18} color={T.fg3} strokeWidth={2} />
          <Text style={styles.value}>{place.address}</Text>
        </View>
      )}

      {hasHours && (
        <View style={styles.block}>
          <View style={styles.blockHead}>
            <Text style={styles.blockTitle}>Horarios</Text>
            <Tag
              label={place.isOpen ? 'Abierto' : 'Cerrado'}
              variant={place.isOpen ? 'primary' : 'secondary'}
              size="sm"
            />
          </View>
          {place.openingHours.slice(0, 4).map(line => (
            <Text key={line} style={styles.line}>{line}</Text>
          ))}
          {place.openingHours.length > 4 && (
            <Text style={styles.moreHours}>+{place.openingHours.length - 4} días más</Text>
          )}
        </View>
      )}

      {hasServices && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>
            {place.servicesUrl ? 'Menú y servicios' : 'Servicios'}
          </Text>
          {place.servicesUrl ? (
            <Pressable onPress={openServices} hitSlop={6}>
              <Text style={styles.link}>{place.servicesLabel}</Text>
            </Pressable>
          ) : (
            <Text style={styles.line}>{place.servicesLabel}</Text>
          )}
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    paddingBottom: S.xxl,
    backgroundColor: T.surface,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.3,
    marginBottom: S.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.sm,
    marginBottom: S.xl,
  },
  value: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg2,
    lineHeight: 22,
  },
  block: {
    marginBottom: S.xl,
    gap: S.sm,
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.md,
  },
  blockTitle: {
    fontFamily: FONT.medium,
    fontSize: F.size.md,
    fontWeight: F.weight.medium,
    color: T.fg1,
  },
  line: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    lineHeight: 22,
  },
  moreHours: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg4,
  },
  link: {
    fontFamily: FONT.medium,
    fontSize: F.size.md,
    color: T.primary,
  },
})
