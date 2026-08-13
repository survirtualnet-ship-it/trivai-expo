import { DIMENSION_WEIGHTS } from './weights'
import {
  scoreGalleryDimension,
  scoreHoursDimension,
  scoreProductsDimension,
  scoreProfileDimension,
  scoreReputationDimension,
} from './rules'
import type {
  BusinessHealthInput,
  BusinessHealthScore,
  HealthDimensionId,
  HealthDimensionScore,
  HealthLevel,
  HealthLevelLabel,
} from './types'

const DIMENSION_LABELS: Record<HealthDimensionId, string> = {
  profile: 'Perfil',
  products: 'Productos',
  hours: 'Horarios',
  gallery: 'Galería',
  reputation: 'Reputación',
}

function levelFromScore(score: number): { level: HealthLevel; levelLabel: HealthLevelLabel } {
  if (score >= 85) return { level: 'excellent', levelLabel: 'Excelente' }
  if (score >= 70) return { level: 'good', levelLabel: 'Bueno' }
  if (score >= 50) return { level: 'needs_improvement', levelLabel: 'Puede mejorar' }
  return { level: 'incomplete', levelLabel: 'Incompleto' }
}

function buildDimension(
  id: HealthDimensionId,
  percent: number,
  hints: string[],
): HealthDimensionScore {
  const weight = DIMENSION_WEIGHTS[id]
  const weightedPoints = Math.round((percent / 100) * weight)
  return {
    id,
    label: DIMENSION_LABELS[id],
    percent,
    weightedPoints,
    maxWeightedPoints: weight,
    hints,
  }
}

export function calculateHealthScore(input: BusinessHealthInput): BusinessHealthScore {
  const profile = scoreProfileDimension(input)
  const products = scoreProductsDimension(input)
  const hours = scoreHoursDimension(input)
  const gallery = scoreGalleryDimension(input)
  const reputation = scoreReputationDimension(input)

  const dimensions: HealthDimensionScore[] = [
    buildDimension('profile', profile.percent, profile.hints),
    buildDimension('products', products.percent, products.hints),
    buildDimension('hours', hours.percent, hours.hints),
    buildDimension('gallery', gallery.percent, gallery.hints),
    buildDimension('reputation', reputation.percent, reputation.hints),
  ]

  const score = dimensions.reduce((sum, d) => sum + d.weightedPoints, 0)
  const maxScore = 100
  const { level, levelLabel } = levelFromScore(score)

  return {
    score,
    maxScore,
    level,
    levelLabel,
    dimensions,
    calculatedAt: new Date().toISOString(),
  }
}
