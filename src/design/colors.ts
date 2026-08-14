/**
 * Trivai official color palette.
 * Primary: Orange · Secondary: Green · Always light surfaces.
 */
export const colors = {
  /** Brand primary — CTAs, active states, key accents */
  primary: '#FF7A00',
  primarySoft: '#FFF3E6',
  primaryInk: '#C45F00',

  /** Brand secondary — success, nature, verified */
  secondary: '#2E7D32',
  secondarySoft: '#E8F5E9',
  secondaryInk: '#1B5E20',

  /** Surfaces — never dark */
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  muted: '#F0F0F0',

  /** Text — high contrast on light backgrounds */
  text: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#8E8E93',
  textDisabled: '#C7C7CC',

  /** Borders & dividers */
  border: '#E8E8E8',
  borderStrong: '#D1D1D6',

  /** Semantic */
  danger: '#D32F2F',
  dangerSoft: '#FFEBEE',
  warning: '#F9A825',
  warningSoft: '#FFF8E1',
  success: '#2E7D32',
  successSoft: '#E8F5E9',
  info: '#1565C0',
  infoSoft: '#E3F2FD',

  /** Overlays & on-color text */
  overlay: 'rgba(26, 26, 26, 0.45)',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',

  /** Legacy aliases (migration) — map old purple/orange refs */
  accent: '#FF7A00',
  purple: '#FF7A00',
  orange: '#FF7A00',
  green: '#2E7D32',
} as const

export type DesignColors = typeof colors
