import type {
  ActivityFriend,
  ActivityUser,
  FeedActivity,
} from '../store/useActivityStore'

const now = Date.now()
const min = (n: number) => now - n * 60_000

export const MOCK_USER: ActivityUser = {
  id: 'me',
  name: 'Camila Ríos',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80',
}

export const MOCK_FRIENDS: ActivityFriend[] = [
  {
    id: 'f1',
    name: 'Carlos Mendoza',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&q=80',
    isActive: true,
  },
  {
    id: 'f2',
    name: 'Ana Torres',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&q=80',
    isActive: true,
  },
  {
    id: 'f3',
    name: 'Luis Vega',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&q=80',
    isActive: true,
  },
  {
    id: 'f4',
    name: 'María Paz',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&q=80',
    isActive: false,
  },
  {
    id: 'f5',
    name: 'Diego Roca',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&q=80',
    isActive: false,
  },
]

const PLACES = {
  rooftop: {
    id: 'p1',
    name: 'Bar La Rinconada',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=640&q=80',
    category: 'Rooftop',
    rating: 4.4,
  },
  cafe: {
    id: 'p2',
    name: 'Café 24 de Septiembre',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&q=80',
    category: 'Café',
    rating: 4.5,
  },
  food: {
    id: 'p3',
    name: 'Equipetrol · Food Court',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&q=80',
    category: 'Gastronomía',
    rating: 4.6,
  },
  park: {
    id: 'p4',
    name: 'Parque Urbano',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&q=80',
    category: 'Parque',
    rating: 4.6,
  },
  event: {
    id: 'p5',
    name: 'Fexpocruz · Noche de feria',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=640&q=80',
    category: 'Evento',
    rating: 4.7,
  },
  brunch: {
    id: 'p6',
    name: 'Los Tajibos · Brunch',
    imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=640&q=80',
    category: 'Restaurante',
    rating: 4.8,
  },
  museum: {
    id: 'p7',
    name: 'Museo Etno-Folklórico',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=640&q=80',
    category: 'Cultura',
    rating: 4.5,
  },
  market: {
    id: 'p8',
    name: 'Mercado Los Pozos',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&q=80',
    category: 'Gastronomía',
    rating: 4.3,
  },
}

export const MOCK_PERSONAL_ACTIVITIES: FeedActivity[] = [
  { id: 'pa1', scope: 'personal', user: MOCK_USER, type: 'visit', place: PLACES.food, timestamp: min(12), isLive: false },
  { id: 'pa2', scope: 'personal', user: MOCK_USER, type: 'save', place: PLACES.cafe, timestamp: min(45), isLive: false },
  { id: 'pa3', scope: 'personal', user: MOCK_USER, type: 'view', place: PLACES.rooftop, timestamp: min(90), isLive: false },
  { id: 'pa4', scope: 'personal', user: MOCK_USER, type: 'visit', place: PLACES.park, timestamp: min(180), isLive: false },
  { id: 'pa5', scope: 'personal', user: MOCK_USER, type: 'save', place: PLACES.event, timestamp: min(320), isLive: false },
  { id: 'pa6', scope: 'personal', user: MOCK_USER, type: 'view', place: PLACES.brunch, timestamp: min(480), isLive: false },
  { id: 'pa7', scope: 'personal', user: MOCK_USER, type: 'visit', place: PLACES.museum, timestamp: min(720), isLive: false },
  { id: 'pa8', scope: 'personal', user: MOCK_USER, type: 'save', place: PLACES.market, timestamp: min(900), isLive: false },
  { id: 'pa9', scope: 'personal', user: MOCK_USER, type: 'checkin', place: PLACES.rooftop, timestamp: min(2), isLive: true },
  { id: 'pa10', scope: 'personal', user: MOCK_USER, type: 'view', place: PLACES.food, timestamp: min(1440), isLive: false },
]

export const MOCK_FRIENDS_ACTIVITIES: FeedActivity[] = [
  { id: 'fa1', scope: 'friends', user: MOCK_FRIENDS[0], type: 'visit', place: PLACES.rooftop, timestamp: min(8), isLive: false },
  { id: 'fa2', scope: 'friends', user: MOCK_FRIENDS[1], type: 'save', place: PLACES.cafe, timestamp: min(22), isLive: false },
  { id: 'fa3', scope: 'friends', user: MOCK_FRIENDS[2], type: 'checkin', place: PLACES.food, timestamp: min(3), isLive: true },
  { id: 'fa4', scope: 'friends', user: MOCK_FRIENDS[0], type: 'view', place: PLACES.event, timestamp: min(55), isLive: false },
  { id: 'fa5', scope: 'friends', user: MOCK_FRIENDS[1], type: 'visit', place: PLACES.brunch, timestamp: min(130), isLive: false },
  { id: 'fa6', scope: 'friends', user: MOCK_FRIENDS[2], type: 'save', place: PLACES.park, timestamp: min(240), isLive: false },
  { id: 'fa7', scope: 'friends', user: MOCK_FRIENDS[3], type: 'visit', place: PLACES.museum, timestamp: min(360), isLive: false },
  { id: 'fa8', scope: 'friends', user: MOCK_FRIENDS[0], type: 'checkin', place: PLACES.market, timestamp: min(1), isLive: true },
  { id: 'fa9', scope: 'friends', user: MOCK_FRIENDS[4], type: 'view', place: PLACES.rooftop, timestamp: min(600), isLive: false },
  { id: 'fa10', scope: 'friends', user: MOCK_FRIENDS[1], type: 'visit', place: PLACES.food, timestamp: min(800), isLive: false },
]
