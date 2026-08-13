import type {
  BusinessOpportunity,
  OpportunitiesInput,
  OpportunityPriority,
  OpportunityPriorityLabel,
} from './types'

const PRIORITY_LABEL: Record<OpportunityPriority, OpportunityPriorityLabel> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

function opp(
  partial: Omit<BusinessOpportunity, 'priorityLabel' | 'completed'> & { completed?: boolean },
): BusinessOpportunity {
  return {
    ...partial,
    priorityLabel: PRIORITY_LABEL[partial.priority],
    completed: partial.completed ?? false,
  }
}

export function generateOpportunities(input: OpportunitiesInput): BusinessOpportunity[] {
  const completed = new Set(input.completedIds ?? [])
  const panel = `/empresa/${input.placeId}`
  const list: BusinessOpportunity[] = []

  if (input.unansweredReviews > 0) {
    list.push(
      opp({
        id: 'reply-reviews',
        title: 'Responde tus últimas reseñas',
        description: `Tienes ${input.unansweredReviews} reseña${input.unansweredReviews === 1 ? '' : 's'} sin respuesta.`,
        priority: 'high',
        estimatedImpact: 'Puede mejorar la confianza del turista.',
        action: 'Ir a reseñas',
        deepLink: panel,
      }),
    )
  }

  if (input.galleryCount < 4) {
    list.push(
      opp({
        id: 'add-gallery',
        title: 'Agrega fotografías nuevas',
        description: `Tu galería tiene ${input.galleryCount} foto${input.galleryCount === 1 ? '' : 's'}. Recomendamos al menos 4.`,
        priority: 'high',
        estimatedImpact: 'Puede incrementar visitas al perfil.',
        action: 'Subir fotos',
        deepLink: panel,
      }),
    )
  }

  if (input.descriptionLength < 40) {
    list.push(
      opp({
        id: 'complete-description',
        title: 'Completa tu descripción',
        description: 'Una descripción clara ayuda al turista a entender tu propuesta.',
        priority: 'medium',
        estimatedImpact: 'Puede mejorar el posicionamiento.',
        action: 'Editar perfil',
        deepLink: panel,
      }),
    )
  }

  if (input.productCount < 3) {
    list.push(
      opp({
        id: 'add-products',
        title: 'Publica más productos',
        description:
          input.productCount === 0
            ? 'Tu catálogo está vacío.'
            : `Tienes ${input.productCount} producto${input.productCount === 1 ? '' : 's'} publicados.`,
        priority: 'medium',
        estimatedImpact: 'Puede aumentar la conversión.',
        action: 'Agregar producto',
        deepLink: panel,
      }),
    )
  }

  if (!input.hoursComplete) {
    list.push(
      opp({
        id: 'update-hours',
        title: 'Actualiza tu horario',
        description: 'Los turistas necesitan saber cuándo visitarte.',
        priority: 'medium',
        estimatedImpact: 'Puede incrementar visitas.',
        action: 'Editar horarios',
        deepLink: `${panel}?tab=hours`,
      }),
    )
  }

  if (!input.hasPromotions) {
    list.push(
      opp({
        id: 'activate-promo',
        title: 'Activa una promoción',
        description: 'Destaca ofertas para turistas cerca de tu negocio.',
        priority: 'low',
        estimatedImpact: 'Puede aumentar la conversión.',
        action: 'Crear promoción',
        deepLink: panel,
      }),
    )
  }

  for (const dim of input.healthDimensions) {
    if (dim.percent >= 70) continue
    for (const hint of dim.hints.slice(0, 1)) {
      list.push(
        opp({
          id: `health-${dim.id}-${hint.slice(0, 12)}`,
          title: hint,
          description: `Tu dimensión "${dim.id}" está al ${dim.percent}%.`,
          priority: dim.percent < 40 ? 'high' : 'medium',
          estimatedImpact: 'Puede mejorar tu Business Health Score.',
          action: 'Mejorar perfil',
          deepLink: panel,
        }),
      )
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const
  return list
    .filter(o => !completed.has(o.id))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 8)
    .map(o => ({ ...o, completed: completed.has(o.id) }))
}
