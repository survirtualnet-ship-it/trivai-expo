import { memo } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { UtensilsCrossed, Palette, Trees, Sparkles } from 'lucide-react-native'
import { FilterChip } from '@/components/ui/FilterChip'
import { CategoryChip } from '@/components/ui/PlaceCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { T, S } from '@/lib/tokens'
import type { Category } from '@/lib/categories'
import { CITY_ZONES } from '@/lib/zones'
import type { CategoryFilter, LocationFilter } from '@/lib/discoverFilters'
import type { DiscoverStrings } from '@/lib/i18n/discover'

const CATEGORIAS: {
  label: Category
  Icon: typeof UtensilsCrossed
  color: string
  bg: string
}[] = [
  { label: 'Gastronomía',     Icon: UtensilsCrossed, color: T.accent,    bg: T.orangeSoft },
  { label: 'Entretenimiento', Icon: Palette,         color: T.primary,   bg: T.purpleSoft },
  { label: 'Parques',         Icon: Trees,           color: T.secondary, bg: T.greenSoft },
  { label: 'Otros',           Icon: Sparkles,        color: T.fg2,       bg: T.muted },
]

type Props = {
  t: DiscoverStrings
  locationFilter: LocationFilter | null
  categoryFilter: CategoryFilter
  onSelectLocation: (f: LocationFilter) => void
  onSelectCategory: (cat: CategoryFilter) => void
}

export const DiscoverFilterBar = memo(function DiscoverFilterBar({
  t,
  locationFilter,
  categoryFilter,
  onSelectLocation,
  onSelectCategory,
}: Props) {
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <FilterChip label={t.filterHoy} active={locationFilter === 'hoy'} onPress={() => onSelectLocation('hoy')} />
        <FilterChip label={t.filterCerca} active={locationFilter === 'cerca'} onPress={() => onSelectLocation('cerca')} accent={T.secondary} />
        {CITY_ZONES.map(z => (
          <FilterChip key={z} label={z} active={locationFilter === z} onPress={() => onSelectLocation(z)} />
        ))}
      </ScrollView>

      <SectionHeader title="Explorar por tipo" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip
          label={t.filterTodos}
          active={categoryFilter === 'Todos'}
          onPress={() => onSelectCategory('Todos')}
        />
        {CATEGORIAS.map(c => (
          <CategoryChip
            key={c.label}
            label={c.label}
            Icon={c.Icon}
            color={c.color}
            bg={c.bg}
            active={categoryFilter === c.label}
            onPress={() => onSelectCategory(c.label)}
          />
        ))}
      </ScrollView>
    </>
  )
})

const styles = StyleSheet.create({
  filters: { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: S.xs },
  chips: { paddingHorizontal: S.lg, gap: S.sm, paddingBottom: S.xs },
})
