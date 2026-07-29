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

export type ExplorerLocationId = 'near_me' | 'santa_cruz' | 'equipetrol' | 'urbari'

export interface ExplorerLocationOption {
  id: ExplorerLocationId
  label: string
  center: { lat: number; lng: number }
}

export const EXPLORER_LOCATIONS: ExplorerLocationOption[] = [
  { id: 'santa_cruz', label: 'Santa Cruz', center: { lat: -17.7833, lng: -63.1821 } },
  { id: 'equipetrol', label: 'Equipetrol', center: { lat: -17.7638, lng: -63.1712 } },
  { id: 'urbari', label: 'Urbarí', center: { lat: -17.7565, lng: -63.1825 } },
  { id: 'near_me', label: 'Cerca de mí', center: { lat: -17.7833, lng: -63.1821 } },
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
