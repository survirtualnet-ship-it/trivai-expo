import { useCallback, useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import { deferredPush } from '@/lib/deferredNav'
import { CategoryHeader } from './components/CategoryHeader'
import { SubcategoryGrid } from './components/SubcategoryGrid'
import { ZoneFilters } from './components/ZoneFilters'
import { SectionList } from './components/SectionList'
import { EmptyState } from './components/EmptyState'
import { useCategoryStore } from './store/useCategoryStore'
import {
  getCategoryById,
  filterPlaces,
  buildSections,
  type CategoryId,
  type CategoryPlace,
  type Locale,
} from './data/mockCategoryData'
import { categoryTheme } from './theme'

type Props = {
  categoryId: string
  locale?: Locale
}

export function CategoryScreen({ categoryId, locale: localeProp = 'ES' }: Props) {
  const initCategory = useCategoryStore(s => s.initCategory)
  const setSubcategory = useCategoryStore(s => s.setSubcategory)
  const setZone = useCategoryStore(s => s.setZone)
  const setLocale = useCategoryStore(s => s.setLocale)
  const selectedSubcategoryId = useCategoryStore(s => s.selectedSubcategoryId)
  const selectedZone = useCategoryStore(s => s.selectedZone)
  const selectedCategoryId = useCategoryStore(s => s.selectedCategoryId)
  const places = useCategoryStore(s => s.places)
  const locale = useCategoryStore(s => s.locale)

  const category = useMemo(
    () => getCategoryById(categoryId),
    [categoryId],
  )

  useEffect(() => {
    if (category) initCategory(category.id as CategoryId)
  }, [category, initCategory])

  useEffect(() => {
    setLocale(localeProp)
  }, [localeProp, setLocale])

  const filteredPlaces = useMemo(() => {
    if (!selectedCategoryId) return []
    return filterPlaces(places, selectedCategoryId, selectedSubcategoryId, selectedZone)
  }, [places, selectedCategoryId, selectedSubcategoryId, selectedZone])

  const sections = useMemo(() => buildSections(filteredPlaces), [filteredPlaces])
  const hasResults = filteredPlaces.length > 0

  const filterKey = `${selectedSubcategoryId ?? 'all'}-${selectedZone ?? 'all'}`

  const categoryTitle = useMemo(() => {
    if (!category) return ''
    return locale === 'EN' ? category.nameEn : category.nameEs
  }, [category, locale])

  const onPressPlace = useCallback((place: CategoryPlace) => {
    deferredPush(`/lugares/${place.id}`)
  }, [])

  const onClearFilters = useCallback(() => {
    setSubcategory(null)
    setZone(null)
  }, [setSubcategory, setZone])

  if (!category) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <CategoryHeader title="Categoría" icon="apps" tint={categoryTheme.textMuted} />
        <EmptyState locale={locale} onClearFilters={() => router.back()} />
      </SafeAreaView>
    )
  }

  const nearbyTitle = locale === 'EN' ? 'Near you' : 'Cerca de ti'
  const trendingTitle = locale === 'EN' ? 'Trending' : 'Tendencias'
  const forYouTitle = locale === 'EN' ? 'For you' : 'Para ti'
  const recommendedTitle = locale === 'EN' ? 'Recommended' : 'Recomendados'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[2]}
        decelerationRate="fast"
      >
        <CategoryHeader
          title={categoryTitle}
          icon={category.icon}
          tint={category.tint}
        />

        <SubcategoryGrid
          subcategories={category.subcategories}
          selectedId={selectedSubcategoryId}
          locale={locale}
          tint={category.tint}
          onSelect={setSubcategory}
        />

        <View style={styles.stickyFilters}>
          <ZoneFilters
            locale={locale}
            selected={selectedZone}
            onSelect={setZone}
          />
        </View>

        <Animated.View layout={Layout.springify()} key={filterKey} style={styles.sections}>
          {hasResults ? (
            <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)}>
              <SectionList
                title={nearbyTitle}
                places={sections.nearby}
                onPressPlace={onPressPlace}
                index={0}
              />
              <SectionList
                title={trendingTitle}
                places={sections.trending}
                onPressPlace={onPressPlace}
                index={1}
              />
              <SectionList
                title={forYouTitle}
                places={sections.forYou}
                onPressPlace={onPressPlace}
                index={2}
              />
              <SectionList
                title={recommendedTitle}
                places={sections.recommended}
                onPressPlace={onPressPlace}
                index={3}
              />
            </Animated.View>
          ) : (
            <EmptyState locale={locale} onClearFilters={onClearFilters} />
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: categoryTheme.bg,
  },
  content: {
    paddingBottom: categoryTheme.spacing.xxl,
  },
  stickyFilters: {
    backgroundColor: categoryTheme.bg,
    zIndex: 10,
  },
  sections: {
    minHeight: 200,
  },
  bottomSpacer: {
    height: categoryTheme.spacing.xxl,
  },
})
