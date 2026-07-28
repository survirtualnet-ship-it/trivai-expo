import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { PlaceDetail } from '@/lib/placeDetail'
import { mapPlaceToDetail } from '@/lib/placeDetail'
import type { Place } from '@/lib/supabase'

/** UI mock categories — map to app taxonomy via `mockCategoryToApp`. */
export type MockPlaceCategory = 'Restaurante' | 'Café' | 'Hotel'

export interface MockPlace {
  id: string
  name: string
  category: MockPlaceCategory
  latitude: number
  longitude: number
  rating: number
  priceLevel: 1 | 2 | 3
  tags: string[]
  images: string[]
}

/** Santa Cruz de la Sierra — realistic coords across common zones */
export const MOCK_PLACES: MockPlace[] = [
  // — Restaurantes —
  {
    id: 'mock-rest-001',
    name: 'La Terraza del Chef',
    category: 'Restaurante',
    latitude: -17.7834,
    longitude: -63.1822,
    rating: 4.7,
    priceLevel: 3,
    tags: ['Pareja', 'Gourmet', 'Terraza'],
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-002',
    name: 'El Arriero Parrillada',
    category: 'Restaurante',
    latitude: -17.7712,
    longitude: -63.1648,
    rating: 4.5,
    priceLevel: 2,
    tags: ['Amigos', 'Parrilla', 'Carnes'],
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-003',
    name: 'Jardín de Asia',
    category: 'Restaurante',
    latitude: -17.7655,
    longitude: -63.1895,
    rating: 4.4,
    priceLevel: 2,
    tags: ['Familiar', 'Asiático', 'Vegetariano'],
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-004',
    name: 'Casa del Camba',
    category: 'Restaurante',
    latitude: -17.7891,
    longitude: -63.1755,
    rating: 4.6,
    priceLevel: 2,
    tags: ['Local', 'Tradicional', 'Almuerzo'],
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-005',
    name: 'Sushi Zen SCZ',
    category: 'Restaurante',
    latitude: -17.7708,
    longitude: -63.1662,
    rating: 4.3,
    priceLevel: 3,
    tags: ['Pareja', 'Sushi', 'Delivery'],
    images: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-006',
    name: 'Pizzería Napolitana',
    category: 'Restaurante',
    latitude: -17.7789,
    longitude: -63.1910,
    rating: 4.2,
    priceLevel: 1,
    tags: ['Familiar', 'Pizza', 'Económico'],
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    ],
  },
  {
    id: 'mock-rest-007',
    name: 'Mercado Gourmet 360',
    category: 'Restaurante',
    latitude: -17.7740,
    longitude: -63.1780,
    rating: 4.8,
    priceLevel: 3,
    tags: ['Trendy', 'Brunch', 'Cócteles'],
    images: [
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80',
    ],
  },

  // — Cafés —
  {
    id: 'mock-cafe-001',
    name: 'Café 24',
    category: 'Café',
    latitude: -17.7820,
    longitude: -63.1810,
    rating: 4.4,
    priceLevel: 2,
    tags: ['Trabajo', 'WiFi', 'Desayuno'],
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    ],
  },
  {
    id: 'mock-cafe-002',
    name: 'Kaffeine Lab',
    category: 'Café',
    latitude: -17.7698,
    longitude: -63.1635,
    rating: 4.6,
    priceLevel: 2,
    tags: ['Specialty coffee', 'Minimal', 'Pareja'],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
    ],
  },
  {
    id: 'mock-cafe-003',
    name: 'Dulce Mañana',
    category: 'Café',
    latitude: -17.7865,
    longitude: -63.1875,
    rating: 4.1,
    priceLevel: 1,
    tags: ['Familiar', 'Postres', 'Panadería'],
    images: [
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    ],
  },
  {
    id: 'mock-cafe-004',
    name: 'The Coffee Bean SCZ',
    category: 'Café',
    latitude: -17.7725,
    longitude: -63.1705,
    rating: 4.0,
    priceLevel: 2,
    tags: ['Cadena', 'Frío', 'Amigos'],
    images: [
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
    ],
  },
  {
    id: 'mock-cafe-005',
    name: 'Panadería La Suiza',
    category: 'Café',
    latitude: -17.7805,
    longitude: -63.1955,
    rating: 4.5,
    priceLevel: 1,
    tags: ['Clásico', 'Empanadas', 'Desayuno'],
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    ],
  },
  {
    id: 'mock-cafe-006',
    name: 'Matcha & Co.',
    category: 'Café',
    latitude: -17.7688,
    longitude: -63.1688,
    rating: 4.3,
    priceLevel: 2,
    tags: ['Matcha', 'Vegano', 'Instagrammable'],
    images: [
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
    ],
  },

  // — Hoteles —
  {
    id: 'mock-hotel-001',
    name: 'Hotel Camino Real',
    category: 'Hotel',
    latitude: -17.7735,
    longitude: -63.1720,
    rating: 4.6,
    priceLevel: 3,
    tags: ['Business', 'Piscina', 'Centro'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    ],
  },
  {
    id: 'mock-hotel-002',
    name: 'Hotel Los Tajibos',
    category: 'Hotel',
    latitude: -17.7668,
    longitude: -63.1610,
    rating: 4.8,
    priceLevel: 3,
    tags: ['Lujo', 'Spa', 'Eventos'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
  },
  {
    id: 'mock-hotel-003',
    name: 'Hotel Cochabamba',
    category: 'Hotel',
    latitude: -17.7848,
    longitude: -63.1805,
    rating: 4.2,
    priceLevel: 2,
    tags: ['Histórico', 'Centro', 'Desayuno incluido'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    ],
  },
  {
    id: 'mock-hotel-004',
    name: 'Radisson Santa Cruz',
    category: 'Hotel',
    latitude: -17.7702,
    longitude: -63.1675,
    rating: 4.5,
    priceLevel: 3,
    tags: ['Aeropuerto', 'Ejecutivo', 'Gimnasio'],
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    ],
  },
  {
    id: 'mock-hotel-005',
    name: 'Hotel Bianco',
    category: 'Hotel',
    latitude: -17.7758,
    longitude: -63.1845,
    rating: 4.0,
    priceLevel: 2,
    tags: ['Boutique', 'Pareja', 'Equipetrol'],
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    ],
  },
]

const PRICE_LABELS: Record<1 | 2 | 3, string> = {
  1: '€',
  2: '€€',
  3: '€€€',
}

const ADDRESSES: Record<string, string> = {
  'mock-rest-001': 'Av. Monseñor Rivero 320, Centro',
  'mock-rest-002': 'Av. San Martín 450, Equipetrol',
  'mock-rest-003': 'Av. Busch 890, Urbari',
  'mock-rest-004': 'Calle Potosí 145, Centro',
  'mock-rest-005': '2do Anillo 780, Equipetrol',
  'mock-rest-006': 'Av. Beni 2100, Norte',
  'mock-rest-007': 'Av. Roca y Coronado 360, Equipetrol',
  'mock-cafe-001': 'Calle 21 de Mayo 112, Centro',
  'mock-cafe-002': 'Av. San Martín 280, Equipetrol',
  'mock-cafe-003': 'Av. Busch 520, Urbari',
  'mock-cafe-004': 'Av. Alemana 615, Equipetrol',
  'mock-cafe-005': 'Av. Mutualista 1450, Plan 3000',
  'mock-cafe-006': 'Av. Banzer 520, Norte',
  'mock-hotel-001': 'Av. San Martín 520, Equipetrol',
  'mock-hotel-002': 'Av. San Martín 680, Equipetrol',
  'mock-hotel-003': 'Plaza 24 de Septiembre 100, Centro',
  'mock-hotel-004': 'Av. San Aurelio 100, Norte',
  'mock-hotel-005': 'Calle 8 Oeste 45, Equipetrol',
}

export function mockCategoryToApp(category: MockPlaceCategory): string {
  if (category === 'Hotel') return 'Otros'
  return 'Gastronomía'
}

export function mockPlacesByCategory(category: MockPlaceCategory): MockPlace[] {
  return MOCK_PLACES.filter(p => p.category === category)
}

export function getMockPlace(id: string): MockPlace | undefined {
  return MOCK_PLACES.find(p => p.id === id)
}

/** Convert mock row → Supabase `Place` shape for detail screens & queries */
export function mockToPlace(mock: MockPlace): Place {
  const reviewCount = Math.round(mock.rating * 18 + 12)
  return {
    id: mock.id,
    name: mock.name,
    description: `${mock.name} — ${mock.category.toLowerCase()} en Santa Cruz. ${mock.tags.join(', ')}.`,
    category: mockCategoryToApp(mock.category),
    address: ADDRESSES[mock.id] ?? 'Santa Cruz de la Sierra',
    city: 'Santa Cruz de la Sierra',
    latitude: mock.latitude,
    longitude: mock.longitude,
    phone: '+59170000000',
    website: null,
    hours: {
      lunes: '11:00 - 23:00',
      martes: '11:00 - 23:00',
      miércoles: '11:00 - 23:00',
      jueves: '11:00 - 23:00',
      viernes: '11:00 - 00:00',
      sábado: '10:00 - 00:00',
      domingo: '10:00 - 22:00',
    },
    photos: mock.images,
    rating_avg: mock.rating,
    rating_count: reviewCount,
    is_open: true,
    is_sponsored: mock.id === 'mock-rest-007',
    is_featured: mock.rating >= 4.6,
    is_verified: mock.rating >= 4.5,
  }
}

/** Convert mock row → `PlaceCardData` for lists & carousels */
export function mockToPlaceCardData(mock: MockPlace, distKm?: number): PlaceCardData {
  const place = mockToPlace(mock)
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    address: place.address,
    rating_avg: mock.rating,
    rating_count: place.rating_count,
    is_open: place.is_open,
    hours: place.hours,
    latitude: mock.latitude,
    longitude: mock.longitude,
    photos: mock.images,
    is_featured: place.is_featured,
    is_sponsored: place.is_sponsored,
    description: place.description,
    _dist: distKm,
  }
}

/** All mocks as card data — handy for FlatList previews */
export function mockPlaceCardList(): PlaceCardData[] {
  return MOCK_PLACES.map(m => mockToPlaceCardData(m))
}

/** Convert mock → `PlaceDetail` for detail screen previews */
export function mockToPlaceDetail(mock: MockPlace, userCoords?: { lat: number; lng: number } | null): PlaceDetail {
  return mapPlaceToDetail(mockToPlace(mock), userCoords ?? null)
}

export function mockPriceLabel(level: 1 | 2 | 3): string {
  return PRICE_LABELS[level]
}

export const MOCK_PLACE_STATS = {
  total: MOCK_PLACES.length,
  restaurants: mockPlacesByCategory('Restaurante').length,
  cafes: mockPlacesByCategory('Café').length,
  hotels: mockPlacesByCategory('Hotel').length,
} as const
