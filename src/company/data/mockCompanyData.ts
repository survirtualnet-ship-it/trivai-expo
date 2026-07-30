import type { Company, DashboardStats, Product, Review } from '../types'

export const MOCK_COMPANY: Company = {
  id: 'co-001',
  name: 'Los Tajibos · Brunch',
  category: 'Gastronomía',
  description:
    'Brunch de autor en Equipetrol con ambiente premium, café de especialidad y opciones sin gluten. Ideal para reuniones y planes de fin de semana.',
  email: 'reservas@lostajibos.com',
  location: {
    latitude: -17.7765,
    longitude: -63.1689,
    address: 'Av. San Martín, Equipetrol, Santa Cruz',
  },
  phone: '+591 3 123 4567',
  whatsapp: '+591 71234567',
  website: 'https://lostajibos.example.com',
  coverImage:
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
  profileImage:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  rating: 4.8,
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    companyId: 'co-001',
    name: 'Brunch Clásico',
    price: 85,
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=640&q=80',
    description: 'Huevos benedictinos, jugo natural y café americano.',
    category: 'Menú',
    isFeatured: true,
  },
  {
    id: 'prod-002',
    companyId: 'co-001',
    name: 'Bowl Tropical',
    price: 72,
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80',
    description: 'Frutas de estación, granola artesanal y miel local.',
    category: 'Saludable',
    isFeatured: true,
  },
  {
    id: 'prod-003',
    companyId: 'co-001',
    name: 'Café de especialidad',
    price: 28,
    image:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&q=80',
    description: 'Single origin de Yungas, preparación V60 o espresso.',
    category: 'Bebidas',
    isFeatured: false,
  },
  {
    id: 'prod-004',
    companyId: 'co-001',
    name: 'Postre del día',
    price: 35,
    image:
      'https://images.unsplash.com/photo-1481391039750-d96040c97a12?w=640&q=80',
    description: 'Rotación diaria del chef repostero.',
    category: 'Postres',
    isFeatured: false,
  },
]

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    userName: 'María G.',
    rating: 5,
    comment: 'El mejor brunch de Santa Cruz. Servicio impecable y ambiente muy agradable.',
    createdAt: '2026-07-20',
  },
  {
    id: 'rev-002',
    userName: 'Carlos R.',
    rating: 4,
    comment: 'Muy buena comida, un poco de espera los domingos pero vale la pena.',
    companyReply: '¡Gracias Carlos! Reserva con anticipación para evitar fila.',
    createdAt: '2026-07-15',
  },
  {
    id: 'rev-003',
    userName: 'Ana L.',
    rating: 5,
    comment: 'El bowl tropical es increíble. Volveré seguro.',
    createdAt: '2026-07-10',
  },
]

export const MOCK_STATS: DashboardStats = {
  views: 2840,
  clicks: 612,
  saves: 189,
  rating: 4.8,
  weeklyViews: [320, 410, 380, 520, 490, 610, 580],
}

export const MOCK_GALLERY: string[] = [
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=640&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=640&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&q=80',
  'https://images.unsplash.com/photo-1481391039750-d96040c97a12?w=640&q=80',
]

export const DEMO_COMPANY_ID = 'co-001'

export function getCompanyBundle(companyId: string) {
  if (companyId !== MOCK_COMPANY.id) return null
  return {
    company: { ...MOCK_COMPANY, isDemoCompany: true },
    products: MOCK_PRODUCTS,
    reviews: MOCK_REVIEWS,
    stats: MOCK_STATS,
    gallery: MOCK_GALLERY,
  }
}
