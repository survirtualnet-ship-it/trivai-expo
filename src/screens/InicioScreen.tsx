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
import {
  CATEGORIES,
  FOR_YOU_PLACES,
  NEARBY_PLACES,
  QUICK_PLANS,
  RECOMMENDED_PLACES,
  TRENDING_PLACES,
  filterByZone,
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

  const onToggleLocale = useCallback(() => {
    setLocale(prev => (prev === 'ES' ? 'EN' : 'ES'))
  }, [])

  const onSearch = useCallback(() => {
    deferredPush('/buscar')
  }, [])

  const onPressPlace = useCallback((place: PlaceItem) => {
    deferredPush({ pathname: '/lugares/[id]', params: { id: place.id } })
  }, [])

  const onPressPlan = useCallback((plan: QuickPlan) => {
    deferredPush({
      pathname: '/buscar',
      params: { q: plan.titleEs },
    })
  }, [])

  const weather = locale === 'EN' ? '24°C · Sunny' : '24°C · Soleado'
  const fxStatus = locale === 'EN' ? 'Stable' : 'Estable'
  const nearbyTitle = locale === 'EN' ? 'Near you' : 'Cerca de ti'
  const trendingTitle = locale === 'EN' ? 'Trending' : 'Tendencias'
  const forYouTitle = locale === 'EN' ? 'For you' : 'Para ti'
  const planTitle = locale === 'EN' ? 'Quick plan' : 'Plan rápido'
  const recommendedTitle = locale === 'EN' ? 'Recommended' : 'Recomendados'
  const locationLine = locale === 'EN' ? '📍 Lima, Peru' : '📍 Lima, Perú'
  const currencyLine =
    locale === 'EN' ? '💱 USD → PEN · Stable' : '💱 USD → PEN · Estable'
  const alertLine =
    locale === 'EN' ? '🛑 No active alerts' : '🛑 Sin alertas activas'

  const nearby = useMemo(() => filterByZone(NEARBY_PLACES, zone), [zone])
  const trending = useMemo(() => filterByZone(TRENDING_PLACES, zone), [zone])
  const forYou = useMemo(() => filterByZone(FOR_YOU_PLACES, zone), [zone])
  const recommended = useMemo(() => filterByZone(RECOMMENDED_PLACES, zone), [zone])
  const categoryRows = useMemo(() => chunk(CATEGORIES, 2), [])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
      >
        <InicioHeader
          city="Lima"
          weather={weather}
          locale={locale}
          onToggleLocale={onToggleLocale}
        />

        <GlobalSearchBar locale={locale} onPress={onSearch} />

        <ExchangeRateCard
          pair="USD → PEN"
          rate="1 USD = S/ 3.70"
          statusLabel={fxStatus}
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
                    deferredPush({
                      pathname: '/buscar',
                      params: { q: item.titleEs },
                    })
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
          currencyLine={currencyLine}
          alertLine={alertLine}
          hasAlert={false}
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
