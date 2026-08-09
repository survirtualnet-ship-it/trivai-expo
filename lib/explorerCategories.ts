import type { Category } from '@/lib/categories'
import type { PriceLevel } from '@/lib/currencyFormat'

export type ExplorerChipId =
  | 'all'
  | 'restaurants'
  | 'cafes'
  | 'nightlife'
  | 'culture'
  | 'shopping'

export interface ExplorerChip {
  id: ExplorerChipId
  label: string
  emoji: string
  /** Maps to Supabase category filter; null = all */
  category: Category | null
}

export const EXPLORER_CHIPS: ExplorerChip[] = [
  { id: 'all', label: 'Todo', emoji: '✨', category: null },
  { id: 'restaurants', label: 'Restaurantes', emoji: '🍽', category: 'Gastronomía' },
  { id: 'cafes', label: 'Cafés', emoji: '☕', category: 'Gastronomía' },
  { id: 'nightlife', label: 'Vida nocturna', emoji: '🎉', category: 'Entretenimiento' },
  { id: 'culture', label: 'Cultura', emoji: '🏛', category: 'Entretenimiento' },
  { id: 'shopping', label: 'Compras', emoji: '🛍', category: 'Otros' },
]

export function explorerChipCategory(chipId: ExplorerChipId): Category | null {
  return EXPLORER_CHIPS.find(c => c.id === chipId)?.category ?? null
}

/** Only GPS-relative locations — no city-locked neighborhoods. */
export type ExplorerLocationId = 'near_me'

export interface ExplorerLocationOption {
  id: ExplorerLocationId
  label: string
}

export const EXPLORER_LOCATIONS: ExplorerLocationOption[] = [
  { id: 'near_me', label: 'Cerca de mí' },
]

export function estimatePriceLevel(ratingAvg?: number | null): PriceLevel {
  const r = ratingAvg ?? 0
  if (r >= 4.5) return 3
  if (r >= 3.8) return 2
  return 1
}

/** @deprecated Use estimatePriceLevel + formatPriceTierLabel */
export function estimatePriceTier(ratingAvg?: number | null): PriceLevel {
  return estimatePriceLevel(ratingAvg)
}

export type PriceTier = PriceLevel
