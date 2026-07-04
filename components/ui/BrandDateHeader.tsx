import { View, Text, StyleSheet, type ReactNode } from 'react-native'
import { HeaderLogo } from '@/components/ui/AppHeader'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { formatCityDateSplit, type AppLocale } from '@/lib/i18n/discover'

type Props = {
  cityName: string
  locale: AppLocale
  left?: ReactNode
  right?: ReactNode
}

export function BrandDateHeader({ cityName, locale, left, right }: Props) {
  const { city, date } = formatCityDateSplit(cityName, locale)

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.sideLeft}>
          {left ?? <HeaderLogo height={36} />}
        </View>

        <View style={styles.centerCol}>
          <Text style={styles.cityLine} numberOfLines={1}>{city}</Text>
          <Text style={styles.dateLine} numberOfLines={1}>{date}</Text>
        </View>

        <View style={styles.sideRight}>
          {right}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    backgroundColor: T.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
    minHeight: 44,
  },
  sideLeft: {
    minWidth: 52,
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.xs,
  },
  sideRight: {
    minWidth: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: S.sm,
  },
  locationLine: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg2,
    lineHeight: 20,
    textAlign: 'center',
  },
  cityLine: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
  },
  dateLine: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
    textAlign: 'center',
    marginTop: 2,
  },
})
