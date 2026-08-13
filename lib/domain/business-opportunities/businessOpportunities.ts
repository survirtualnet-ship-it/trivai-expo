/**
 * Business Opportunities — rule-based growth recommendations.
 * @see BUSINESS_HEALTH_ARCHITECTURE.md
 */

export type {
  BusinessOpportunity,
  OpportunitiesInput,
  OpportunityPriority,
} from './types'

export { generateOpportunities } from './rules'

import type { BusinessHealthScore } from '@/lib/domain/business-health'
import { generateOpportunities } from './rules'
import type { BusinessOpportunity, OpportunitiesInput } from './types'

export function opportunitiesFromHealth(
  input: Omit<OpportunitiesInput, 'healthDimensions'> & {
    health: BusinessHealthScore
  },
): BusinessOpportunity[] {
  return generateOpportunities({
    ...input,
    healthDimensions: input.health.dimensions.map(d => ({
      id: d.id,
      percent: d.percent,
      hints: d.hints,
    })),
  })
}
