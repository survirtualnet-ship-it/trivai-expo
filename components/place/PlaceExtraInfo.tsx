import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Clock, UtensilsCrossed, Sparkles } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceDetail } from '@/lib/placeDetail'

type Props = {
  place: PlaceDetail
}

export const PlaceExtraInfo = memo(function PlaceExtraInfo({ place }: Props) {
  const hasHours = place.openingHours.length > 0
  const hasServices = !!place.servicesLabel

  if (!hasHours && !hasServices) return null

  const openServices = () => {
    if (!place.servicesUrl) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    Linking.openURL(place.servicesUrl)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Información</Text>

      {hasHours && (
        <View style={styles.block}>
          <View style={styles.blockHead}>
            <Clock size={18} color={T.primary} />
            <Text style={styles.blockTitle}>Horarios</Text>
            <View style={[styles.badge, place.isOpen ? styles.open : styles.closed]}>
              <Text style={[styles.badgeText, place.isOpen ? styles.openText : styles.closedText]}>
                {place.isOpen ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
          </View>
          {place.openingHours.map(line => (
            <Text key={line} style={styles.line}>{line}</Text>
          ))}
        </View>
      )}

      {hasServices && (
        <View style={[styles.block, hasHours && styles.blockSpaced]}>
          <View style={styles.blockHead}>
            {place.servicesUrl ? (
              <UtensilsCrossed size={18} color={T.primary} />
            ) : (
              <Sparkles size={18} color={T.primary} />
            )}
            <Text style={styles.blockTitle}>
              {place.servicesUrl ? 'Menú y servicios' : 'Servicios'}
            </Text>
          </View>
          {place.servicesUrl ? (
            <TouchableOpacity style={styles.linkBtn} onPress={openServices} activeOpacity={0.88}>
              <Text style={styles.linkText}>{place.servicesLabel}</Text>
            </TouchableOpacity>
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
    paddingVertical: S.xl,
    backgroundColor: T.surface,
    marginTop: S.sm,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
    marginBottom: S.md,
  },
  block: {
    backgroundColor: T.bg,
    borderRadius: R.xl,
    padding: S.lg,
    borderWidth: 1,
    borderColor: T.border,
  },
  blockSpaced: {
    marginTop: S.md,
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginBottom: S.sm,
  },
  blockTitle: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.fg1,
  },
  badge: {
    paddingHorizontal: S.sm,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  open: { backgroundColor: T.greenSoft },
  closed: { backgroundColor: T.muted },
  badgeText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
  },
  openText: { color: T.greenInk },
  closedText: { color: T.fg3 },
  line: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg2,
    lineHeight: 22,
    paddingVertical: 2,
  },
  linkBtn: {
    marginTop: S.xs,
    paddingVertical: S.sm,
    paddingHorizontal: S.md,
    backgroundColor: T.purpleSoft,
    borderRadius: R.lg,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
  },
})
