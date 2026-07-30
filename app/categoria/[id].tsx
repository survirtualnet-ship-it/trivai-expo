import { useLocalSearchParams } from 'expo-router'
import { CategoryScreen } from '@/src/category/CategoryScreen'
import type { Locale } from '@/src/category/data/mockCategoryData'

export default function CategoryRoute() {
  const { id, locale } = useLocalSearchParams<{ id: string; locale?: Locale }>()
  return <CategoryScreen categoryId={id ?? ''} locale={locale ?? 'ES'} />
}
