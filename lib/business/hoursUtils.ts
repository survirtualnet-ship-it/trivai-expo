import type { BusinessHoursSchedule, DayHours } from './profileTypes'

export const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type DayKey = (typeof DAY_KEYS)[number]

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export type DayMode = 'open' | 'closed' | 'allDay'

const DEFAULT_SLOT = { open: '9:00 AM', close: '6:00 PM' }

export function getDayMode(day: DayHours | undefined): DayMode {
  if (!day || day.closed) return 'closed'
  if (day.allDay) return 'allDay'
  return 'open'
}

export function createDefaultDayHours(): DayHours {
  return { slots: [{ ...DEFAULT_SLOT }] }
}

export function createDefaultSchedule(): BusinessHoursSchedule {
  const schedule: BusinessHoursSchedule = { temporarilyClosed: false }
  for (const key of DAY_KEYS) {
    schedule[key] = createDefaultDayHours()
  }
  return schedule
}

export function normalizeSchedule(
  raw: BusinessHoursSchedule | null | undefined,
): BusinessHoursSchedule {
  const defaults = createDefaultSchedule()
  if (!raw) return defaults

  const out: BusinessHoursSchedule = {
    temporarilyClosed: raw.temporarilyClosed ?? false,
    specialDates: raw.specialDates,
  }

  for (const key of DAY_KEYS) {
    const day = raw[key]
    if (!day) {
      out[key] = defaults[key]
      continue
    }
    if (day.closed) {
      out[key] = { closed: true }
    } else if (day.allDay) {
      out[key] = { allDay: true }
    } else {
      out[key] = {
        slots: day.slots?.length ? day.slots.map(s => ({ ...s })) : [{ ...DEFAULT_SLOT }],
      }
    }
  }

  return out
}

export function formatDaySummary(day: DayHours | undefined): string {
  if (!day) return '—'
  if (day.closed) return 'Cerrado'
  if (day.allDay) return '24 horas'
  const slot = day.slots?.[0]
  if (!slot) return 'Sin horario'
  return `${slot.open} – ${slot.close}`
}

export function applyDayMode(day: DayHours | undefined, mode: DayMode): DayHours {
  if (mode === 'closed') return { closed: true }
  if (mode === 'allDay') return { allDay: true }
  const slots = day?.slots?.length ? day.slots : [{ ...DEFAULT_SLOT }]
  return { slots: [{ ...slots[0] }] }
}
