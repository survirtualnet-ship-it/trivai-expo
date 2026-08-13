/** @deprecated Use `@/lib/domain/business-health` */
export {
  computeBusinessHealth as calculateBusinessHealthScore,
  buildHealthInput,
  formatHealthScoreDisplay as formatHealthScore,
} from '@/lib/domain/business-health'

export type { BusinessHealthScore as BusinessHealthResult } from '@/lib/domain/business-health'
