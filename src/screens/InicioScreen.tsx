import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  CategoryCard,
  ContextBlock,
  ExchangeRateCard,
  GlobalSearchBar,
  HomePlaceSection,
  InicioHeader,
  PlanRapidoSection,
  ZoneFilter,
} from '../components'
import { deferredPush } from '@/lib/deferredNav'
import { buildHomeSearchParams } from '@/lib/home/searchContext'
import { useCurrency } from '@/hooks/useCurrency'
import { useLocationProfile } from '@/hooks/useLocationProfile'
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces'
import { useNotifications } from '@/hooks/useNotifications'
import { useWeather } from '@/hooks/useWeather'
import {
  CATEGORIES,
  QUICK_PLANS,
  type Locale,
  type PlaceItem,
  type QuickPlan,
  type ZoneId,
} from '../data/mock'
import { colors, spacing } from '../theme'

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

export function InicioScreen() {
  const [locale, setLocale] = useState<Locale>('ES')
  const [zone, setZone] = useState<ZoneId | null>(null)

  const {
    profile,
    permission,
    offline,
    isLoading: isLocationLoading,
    statusMessageEs,
    statusMessageEn,
  } = useLocationProfile()

  const { weather, weatherLine } = useWeather(
    profile?.latitude,
    profile?.longitude,
    locale,
    isLocationLoading,
  )

  const { pairLabel, rateLabel, statusLabel, contextLine } = useCurrency(
    profile?.countryCode,
    locale,
  )

  const { nearby, trending, forYou, recommended, totalCount } = useNearbyPlaces(
    profile,
    zone,
  )

  const { alertLine, hasAlert } = useNotifications(
    profile,
    weather,
    totalCount,
    locale,
  )

  const onToggleLocale = useCallback(() => {
    setLocale(prev => (prev === 'ES' ? 'EN' : 'ES'))
  }, [])

  const onSearch = useCallback(() => {
    if (!profile) {
      deferredPush('/buscar')
      return
    }
    deferredPush({
      pathname: '/buscar',
      params: buildHomeSearchParams(profile, locale),
    })
  }, [profile, locale])

  const onPressPlace = useCallback((place: PlaceItem) => {
    deferredPush({ pathname: '/lugares/[id]', params: { id: place.id } })
  }, [])

  const onPressPlan = useCallback((plan: QuickPlan) => {
    deferredPush({
      pathname: '/buscar',
      params: { q: locale === 'EN' ? plan.titleEn : plan.titleEs },
    })
  }, [locale])

  const onPressCategory = useCallback(
    (categoryId: string, titleEs: string, titleEn: string) => {
      if (profile) {
        deferredPush({
          pathname: '/buscar',
          params: buildHomeSearchParams(profile, locale, categoryId),
        })
        return
      }
      deferredPush({
        pathname: '/buscar',
        params: { q: locale === 'EN' ? titleEn : titleEs },
      })
    },
    [profile, locale],
  )

  const nearbyTitle = locale === 'EN' ? 'Near you' : 'Cerca de ti'
  const trendingTitle = locale === 'EN' ? 'Trending' : 'Tendencias'
  const forYouTitle = locale === 'EN' ? 'For you' : 'Para ti'
  const planTitle = locale === 'EN' ? 'Quick plan' : 'Plan rápido'
  const recommendedTitle = locale === 'EN' ? 'Recommended' : 'Recomendados'

  const cityDisplay = useMemo(() => {
    if (isLocationLoading) {
      return locale === 'EN' ? 'Detecting…' : 'Detectando…'
    }
    return profile?.city ?? (locale === 'EN' ? 'Your city' : 'Tu ciudad')
  }, [isLocationLoading, profile?.city, locale])

  const locationLine = useMemo(() => {
    const statusMsg = locale === 'EN' ? statusMessageEn : statusMessageEs
    if (statusMsg && permission === 'denied' && profile?.source !== 'manual') {
      return statusMsg
    }
    if (offline && profile?.source === 'cache') {
      return locale === 'EN'
        ? '📍 Showing saved information.'
        : '📍 Mostrando información guardada.'
    }
    if (profile) {
      return locale === 'EN'
        ? `📍 ${profile.city}, ${profile.country}`
        : `📍 ${profile.city}, ${profile.country}`
    }
    return locale === 'EN' ? '📍 Location unavailable' : '📍 Ubicación no disponible'
  }, [
    locale,
    statusMessageEn,
    statusMessageEs,
    permission,
    profile,
    offline,
  ])

  const categoryRows = useMemo(() => chunk(CATEGORIES, 2), [])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
      >
        <InicioHeader
          city={cityDisplay}
          weather={weatherLine}
          locale={locale}
          onToggleLocale={onToggleLocale}
        />

        <GlobalSearchBar locale={locale} onPress={onSearch} />

        <ExchangeRateCard
          pair={pairLabel}
          rate={rateLabel}
          statusLabel={statusLabel}
        />

        <ZoneFilter locale={locale} selected={zone} onSelect={setZone} />

        <View style={styles.categories}>
          {categoryRows.map(row => (
            <View key={row.map(c => c.id).join('-')} style={styles.categoryRow}>
              {row.map(item => (
                <CategoryCard
                  key={item.id}
                  title={locale === 'EN' ? item.titleEn : item.titleEs}
                  icon={item.icon}
                  tint={item.tint}
                  onPress={() =>
                    onPressCategory(item.id, item.titleEs, item.titleEn)
                  }
                />
              ))}
            </View>
          ))}
        </View>

        <HomePlaceSection
          title={nearbyTitle}
          places={nearby}
          onPressPlace={onPressPlace}
        />

        <HomePlaceSection
          title={trendingTitle}
          places={trending}
          onPressPlace={onPressPlace}
        />

        <HomePlaceSection
          title={forYouTitle}
          places={forYou}
          onPressPlace={onPressPlace}
        />

        <PlanRapidoSection
          title={planTitle}
          plans={QUICK_PLANS}
          locale={locale}
          onPressPlan={onPressPlan}
        />

        <HomePlaceSection
          title={recommendedTitle}
          places={recommended}
          onPressPlace={onPressPlace}
        />

        <ContextBlock
          locationLine={locationLine}
          currencyLine={contextLine}
          alertLine={alertLine}
          hasAlert={hasAlert}
        />

        <View style={styles.bottom} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  categories: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bottom: {
    height: spacing.xl,
  },
})
