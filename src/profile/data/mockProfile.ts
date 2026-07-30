import type {
  ActivityRecord,
  Achievement,
  AutoPlan,
  CurrentStatus,
  FavoriteList,
  ProfilePreferences,
  ProfileRecommendation,
  ProfileSettings,
  ProfileUser,
} from '../store/useProfileStore'

export const MOCK_USER: ProfileUser = {
  id: 'u1',
  name: 'Camila Ríos',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80',
  initials: 'CR',
  city: 'Santa Cruz de la Sierra',
  travelerType: 'Foodie',
  role: 'tourist',
}

export const MOCK_PREFERENCES: ProfilePreferences = {
  smartTags: ['Explorador urbano', 'Amante del café', 'Fan de rooftops'],
  budgetLevel: 2,
  preferredTime: 'night',
  favoriteCategories: ['Gastronomía', 'Cafés', 'Rooftops', 'Eventos'],
}

export const MOCK_CURRENT_STATUS: CurrentStatus = {
  zone: 'Equipetrol',
  suggestion: 'Hora perfecta para brunch con terraza',
  moodEmoji: '☀️',
}

export const MOCK_RECOMMENDATIONS: ProfileRecommendation[] = [
  {
    id: 'r1',
    name: 'Los Tajibos · Brunch',
    category: 'Gastronomía',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=640&q=80',
    highlight: true,
  },
  {
    id: 'r2',
    name: 'Café 24 de Septiembre',
    category: 'Café',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&q=80',
  },
  {
    id: 'r3',
    name: 'Bar La Rinconada',
    category: 'Rooftop',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=640&q=80',
    highlight: true,
  },
  {
    id: 'r4',
    name: 'Museo Etno-Folklórico',
    category: 'Cultura',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=640&q=80',
  },
  {
    id: 'r5',
    name: 'Mercado Los Pozos',
    category: 'Gastronomía',
    rating: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
  },
]

export const MOCK_AUTO_PLANS: AutoPlan[] = [
  {
    id: 'p1',
    title: 'Tu tarde ideal',
    subtitle: 'Café → paseo → atardecer en rooftop',
    emoji: '🌇',
  },
  {
    id: 'p2',
    title: 'Ruta de bares',
    subtitle: '3 paradas en Equipetrol con música en vivo',
    emoji: '🍸',
  },
  {
    id: 'p3',
    title: 'Plan relajado',
    subtitle: 'Parque, helado y cine al aire libre',
    emoji: '🌿',
  },
]

export const MOCK_ACTIVITY: ActivityRecord[] = [
  {
    id: 'a1',
    placeName: 'Equipetrol · Food Court',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=320&q=80',
    date: 'Hoy · 13:40',
    type: 'visitado',
  },
  {
    id: 'a2',
    placeName: 'Café 24 de Septiembre',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=320&q=80',
    date: 'Ayer · 09:15',
    type: 'guardado',
  },
  {
    id: 'a3',
    placeName: 'Fexpocruz · Noche de feria',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=320&q=80',
    date: 'Sáb · 21:00',
    type: 'visitado',
  },
  {
    id: 'a4',
    placeName: 'Parque Urbano',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=320&q=80',
    date: 'Vie · 18:30',
    type: 'guardado',
  },
]

export const MOCK_FAVORITE_LISTS: FavoriteList[] = [
  {
    id: 'f1',
    title: 'Mis imprescindibles',
    count: 12,
    coverUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
  },
  {
    id: 'f2',
    title: 'Cafés top',
    count: 8,
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
  },
  {
    id: 'f3',
    title: 'Atardeceres',
    count: 5,
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
  },
  {
    id: 'f4',
    title: 'Plan nocturno',
    count: 6,
    coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&q=80',
  },
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach1',
    title: 'Probaste 5 cafés',
    icon: '☕',
    progress: 5,
    total: 5,
    unlocked: true,
  },
  {
    id: 'ach2',
    title: 'Visitaste 3 rooftops',
    icon: '🌃',
    progress: 2,
    total: 3,
    unlocked: false,
  },
  {
    id: 'ach3',
    title: 'Exploraste 4 zonas',
    icon: '🗺️',
    progress: 4,
    total: 4,
    unlocked: true,
  },
  {
    id: 'ach4',
    title: '10 lugares guardados',
    icon: '❤️',
    progress: 7,
    total: 10,
    unlocked: false,
  },
]

export const MOCK_SETTINGS: ProfileSettings = {
  language: 'Español',
  currency: 'BOB (Bs)',
  notifications: true,
  privacy: false,
}
