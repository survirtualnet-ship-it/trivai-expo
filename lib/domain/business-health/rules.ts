import type { BusinessHealthInput } from './types'

/** Returns 0–100 completeness for a dimension. */
export function scoreProfileDimension(input: BusinessHealthInput): {
  percent: number
  hints: string[]
} {
  const hints: string[] = []
  let pts = 0
  const max = 10

  if (input.hasCoverPhoto) pts += 2
  else hints.push('Agrega una foto principal')

  if (input.hasCustomLogo) pts += 1
  else hints.push('Sube tu logo (Plan Pro)')

  if (input.descriptionLength >= 120) pts += 3
  else if (input.descriptionLength >= 40) pts += 2
  else hints.push('Completa tu descripción')

  if (input.hasWhatsApp) pts += 1
  else hints.push('Agrega WhatsApp')

  if (input.hasPhone) pts += 1
  if (input.hasWebsite) pts += 1
  if (input.hasEmail) pts += 1

  const socialTarget = 2
  pts += Math.min(input.socialCount, socialTarget)

  const fieldRatio =
    input.profileFieldsTotal > 0
      ? input.profileFieldsFilled / input.profileFieldsTotal
      : 0
  pts += Math.round(fieldRatio * 2)

  return {
    percent: Math.round((pts / max) * 100),
    hints,
  }
}

export function scoreProductsDimension(input: BusinessHealthInput): {
  percent: number
  hints: string[]
} {
  const hints: string[] = []
  const count = input.productCount + (input.menuItemCount > 0 ? 1 : 0)
  if (count === 0) hints.push('Publica productos o un menú')
  else if (count < 3) hints.push('Agrega más productos')
  const percent = count >= 5 ? 100 : count >= 3 ? 75 : count >= 1 ? 45 : 0
  return { percent, hints }
}

export function scoreHoursDimension(input: BusinessHealthInput): {
  percent: number
  hints: string[]
} {
  const hints: string[] = []
  if (!input.hasCompleteHours) hints.push('Actualiza tu horario')
  return {
    percent: input.hasCompleteHours ? 100 : 0,
    hints,
  }
}

export function scoreGalleryDimension(input: BusinessHealthInput): {
  percent: number
  hints: string[]
} {
  const hints: string[] = []
  const n = input.galleryCount
  if (n === 0) hints.push('Agrega fotografías nuevas')
  else if (n < 4) hints.push('Sube más fotos a tu galería')
  const percent = n >= 8 ? 100 : n >= 4 ? 70 : n >= 1 ? 35 : 0
  return { percent, hints }
}

export function scoreReputationDimension(input: BusinessHealthInput): {
  percent: number
  hints: string[]
} {
  const hints: string[] = []
  if (input.reviewCount === 0) {
    return { percent: 50, hints: ['Invita a tus clientes a dejar reseñas'] }
  }
  if (input.reviewsAnsweredPercent < 100) {
    hints.push('Responde tus últimas reseñas')
  }
  let percent = input.reviewsAnsweredPercent
  if (input.activePromotionCount > 0) percent = Math.min(100, percent + 10)
  return { percent: Math.round(percent), hints }
}
