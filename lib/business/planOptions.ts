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
      'Responder reseñas',
      'Horarios',
      'Datos de contacto',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'PRO',
    priceLabel: 'Próximamente',
    description: 'Herramientas completas para crecer.',
    features: [
      'Todo lo anterior',
      'Dashboard completo',
      'Estadísticas',
      'Productos',
      'Menú',
      'Promociones',
      'Galería',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    priceLabel: 'Próximamente',
    description: 'Máximo alcance y funciones avanzadas.',
    features: [
      'Todo PRO',
      'Campañas',
      'Analítica avanzada',
      'IA (placeholder)',
      'Funciones futuras',
    ],
  },
]

export function planBadgeLabel(tier: BusinessSubscriptionTier): string {
  switch (tier) {
    case 'none':
      return 'Sin plan'
    case 'free':
      return 'Free'
    case 'pro':
      return 'Pro'
    case 'premium':
      return 'Premium'
    default:
      return tier
  }
}
