import { CATEGORY_CHIPS, normalizeCategory, type Category } from '@/lib/categories'
import { EXPLORER_CHIPS } from '@/lib/explorerCategories'
import { matchesSearch } from '@/lib/smartSearch'

export type SearchCategory = {
  id: string
  label: string
  emoji: string
  color: string
  /** App category filter */
  category: Category | null
  href?: string
}

const BASE: SearchCategory[] = [
  ...CATEGORY_CHIPS.map(chip => ({
    id: `cat-${chip.id}`,
    label: chip.label,
    emoji: chip.emoji,
    color: chip.color,
    category: chip.id as Category,
    href: '/discover?type=nearby',
  })),
  ...EXPLORER_CHIPS.filter(c => c.id !== 'all').map(chip => ({
    id: `explorer-${chip.id}`,
    label: chip.label,
    emoji: chip.emoji,
    color: '#6C4CF1',
    category: chip.category,
    href: '/mapa',
  })),
  {
    id: 'cat-hotel',
    label: 'Hoteles',
    emoji: '🏨',
    color: '#5335D9',
    category: 'Otros' as Category,
    href: '/discover?type=nearby',
  },
  {
    id: 'cat-cafe',
    label: 'Cafés',
    emoji: '☕',
    color: '#B45309',
    category: 'Gastronomía' as Category,
    href: '/discover?type=nearby',
  },
]

export const SEARCH_CATEGORIES: SearchCategory[] = dedupeByLabel(BASE)

function dedupeByLabel(items: SearchCategory[]): SearchCategory[] {
  const seen = new Set<string>()
  const out: SearchCategory[] = []
  for (const item of items) {
    const key = item.label.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export function filterSearchCategories(query: string): SearchCategory[] {
  const q = query.trim()
  if (!q) return []
  return SEARCH_CATEGORIES.filter(
    c => matchesSearch(c.label, q) || matchesSearch(normalizeCategory(c.category ?? ''), q),
  )
}

export function findCategoryByLabel(label: string): SearchCategory | undefined {
  return SEARCH_CATEGORIES.find(c => c.label.toLowerCase() === label.toLowerCase())
}
