/** Apple-style tokens scoped to Home (does not mutate global Trivai tokens). */

export const H = {
  bg: '#FFFFFF',
  text: '#111111',
  textSecondary: '#666666',
  border: '#E5E5E5',
  accent: '#0A84FF',
  searchBg: '#F2F2F7',
  emergencyBg: '#FFF5F5',
  emergencyBorder: '#FAD4D4',
  emergencyAccent: '#FF3B30',
  overlay: 'rgba(0,0,0,0.45)',
  padX: 16,
  sectionGap: 24,
  gap: 12,
  radius: 16,
  radiusLg: 20,
} as const

export const homeShadow = {
  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  soft: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const
