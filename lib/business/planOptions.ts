import type { BusinessSubscriptionTier } from '@/lib/domain/business'

export type PlanOption = {
  id: Exclude<BusinessSubscriptionTier, 'none'>
  name: string
  priceLabel: string
  description: string
  features: string[]
  highlighted?: boolean
}

export const BUSINESS_PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'free',
    name: 'FREE',
    priceLabel: 'Bs 0 / mes',
    description: 'Gestión esencial de tu negocio reclamado.',
    features: [
      'Reclamar negocio',
      'Editar información básica',
      'Horarios',
      'Datos de contacto',
      'Responder reseñas',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'PRO',
    priceLabel: 'Próximamente',
    description: 'Herramientas completas para crecer.',
    features: [
      'Todo Free',
      'Dashboard',
      'Estadísticas',
      'Productos',
      'Menú',
      'Promociones',
      'Galería',
      'Analytics',
      'Prioridad en recomendaciones (placeholder)',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    priceLabel: 'Próximamente',
    description: 'Máximo alcance y funciones avanzadas.',
    features: [
      'Todo Pro',
      'IA (placeholder)',
      'Campañas',
      'Automatizaciones',
      'Reportes avanzados',
      'Funciones futuras',
    ],
  },
]

export function planBadgeLabel(tier: BusinessSubscriptionTier): string {
  switch (tier) {
    case 'none':
      return 'Sin plan'
    case 'free':
      return 'FREE'
    case 'pro':
      return 'PRO'
    case 'premium':
      return 'PREMIUM'
    default:
      return tier
  }
}

export function planManageActionLabel(tier: BusinessSubscriptionTier): string {
  if (tier === 'free') return 'Cambiar plan'
  if (tier === 'pro' || tier === 'premium') return 'Administrar suscripción'
  return 'Elegir plan'
}
