import type { HealthDimensionId } from './types'

/**
 * Configurable dimension weights (must sum to 100).
 * Adjust per market/category without changing rule logic.
 */
export const DIMENSION_WEIGHTS: Record<HealthDimensionId, number> = {
  profile: 30,
  products: 15,
  hours: 15,
  gallery: 20,
  reputation: 20,
}

export const TOTAL_WEIGHT = Object.values(DIMENSION_WEIGHTS).reduce((a, b) => a + b, 0)

export function assertWeightsValid(): void {
  if (TOTAL_WEIGHT !== 100 && __DEV__) {
    console.warn('[business-health] DIMENSION_WEIGHTS must sum to 100, got', TOTAL_WEIGHT)
  }
}
