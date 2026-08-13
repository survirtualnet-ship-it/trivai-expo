import { supabase } from '@/lib/supabase'
import type {
  BusinessEnrichment,
  BusinessHoursSchedule,
  SocialLinks,
} from './profileTypes'

type EnrichmentRow = {
  place_id: string
  whatsapp: string | null
  phone_secondary: string | null
  email_commercial: string | null
  services: string[] | null
  languages: string[] | null
  payment_methods: string[] | null
  accessibility: unknown
  amenities: unknown
  hours: BusinessHoursSchedule | null
  hours_complete: boolean
  temporarily_closed: boolean
  social_instagram: string | null
  social_facebook: string | null
  social_tiktok: string | null
  social_youtube: string | null
  social_linkedin: string | null
  social_x: string | null
  google_synced_at: string | null
  updated_at: string
}

function mapRow(row: EnrichmentRow): BusinessEnrichment {
  return {
    placeId: row.place_id,
    whatsapp: row.whatsapp,
    phoneSecondary: row.phone_secondary,
    emailCommercial: row.email_commercial,
    services: Array.isArray(row.services) ? row.services : [],
    languages: row.languages ?? [],
    paymentMethods: row.payment_methods ?? [],
    accessibility: Array.isArray(row.accessibility) ? (row.accessibility as string[]) : [],
    amenities: Array.isArray(row.amenities) ? (row.amenities as string[]) : [],
    hours: row.hours,
    hoursComplete: row.hours_complete,
    social: {
      instagram: row.social_instagram,
      facebook: row.social_facebook,
      tiktok: row.social_tiktok,
      youtube: row.social_youtube,
      linkedin: row.social_linkedin,
      x: row.social_x,
    },
    updatedAt: row.updated_at,
    googleSyncedAt: row.google_synced_at,
  }
}

export function evaluateHoursComplete(hours: BusinessHoursSchedule | null): boolean {
  if (!hours) return false
  if (hours.temporarilyClosed) return false
  const keys = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const
  return keys.every(key => {
    const day = hours[key]
    if (!day) return false
    if (day.closed) return true
    if (day.allDay) return true
    return (day.slots?.length ?? 0) > 0
  })
}

export async function fetchBusinessEnrichment(
  placeId: string,
): Promise<BusinessEnrichment | null> {
  const { data, error } = await supabase
    .from('business_enrichment')
    .select('*')
    .eq('place_id', placeId)
    .maybeSingle()

  if (error) {
    if (__DEV__) console.warn('[fetchBusinessEnrichment]', error.message)
    return null
  }
  if (!data) return null
  return mapRow(data as EnrichmentRow)
}

export async function upsertBusinessEnrichment(
  placeId: string,
  patch: Partial<Omit<BusinessEnrichment, 'placeId' | 'updatedAt' | 'googleSyncedAt'>>,
): Promise<{ ok: boolean; error?: string }> {
  const hours = patch.hours !== undefined ? patch.hours : undefined
  const hoursComplete =
    hours !== undefined ? evaluateHoursComplete(hours) : patch.hoursComplete

  const row: Record<string, unknown> = {
    place_id: placeId,
    updated_at: new Date().toISOString(),
  }

  if (patch.whatsapp !== undefined) row.whatsapp = patch.whatsapp
  if (patch.phoneSecondary !== undefined) row.phone_secondary = patch.phoneSecondary
  if (patch.emailCommercial !== undefined) row.email_commercial = patch.emailCommercial
  if (patch.services !== undefined) row.services = patch.services
  if (patch.languages !== undefined) row.languages = patch.languages
  if (patch.paymentMethods !== undefined) row.payment_methods = patch.paymentMethods
  if (patch.accessibility !== undefined) row.accessibility = patch.accessibility
  if (patch.amenities !== undefined) row.amenities = patch.amenities
  if (hours !== undefined) row.hours = hours
  if (hoursComplete !== undefined) row.hours_complete = hoursComplete

  if (patch.social) {
    const s: SocialLinks = patch.social
    if (s.instagram !== undefined) row.social_instagram = s.instagram
    if (s.facebook !== undefined) row.social_facebook = s.facebook
    if (s.tiktok !== undefined) row.social_tiktok = s.tiktok
    if (s.youtube !== undefined) row.social_youtube = s.youtube
    if (s.linkedin !== undefined) row.social_linkedin = s.linkedin
    if (s.x !== undefined) row.social_x = s.x
  }

  const { error } = await supabase.from('business_enrichment').upsert(row, {
    onConflict: 'place_id',
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/** Persist Trivai-editable fields on places + enrichment split. */
export async function saveBusinessContact(input: {
  placeId: string
  description?: string
  phone?: string
  website?: string
  whatsapp?: string
  emailCommercial?: string
  phoneSecondary?: string
}): Promise<{ ok: boolean; error?: string }> {
  const placeUpdate: Record<string, unknown> = {}
  if (input.description !== undefined) placeUpdate.description = input.description
  if (input.phone !== undefined) placeUpdate.phone = input.phone
  if (input.website !== undefined) placeUpdate.website = input.website

  if (Object.keys(placeUpdate).length > 0) {
    const { error } = await supabase
      .from('places')
      .update(placeUpdate)
      .eq('id', input.placeId)
    if (error) return { ok: false, error: error.message }
  }

  return upsertBusinessEnrichment(input.placeId, {
    whatsapp: input.whatsapp ?? null,
    emailCommercial: input.emailCommercial ?? null,
    phoneSecondary: input.phoneSecondary ?? null,
  })
}

export async function saveBusinessHours(
  placeId: string,
  hours: BusinessHoursSchedule,
): Promise<{ ok: boolean; error?: string }> {
  const hoursComplete = evaluateHoursComplete(hours)

  const enrichmentResult = await upsertBusinessEnrichment(placeId, {
    hours,
    hoursComplete,
  })
  if (!enrichmentResult.ok) return enrichmentResult

  // Legacy compat: flat map for tourist hours display
  const flat = hoursScheduleToLegacyRecord(hours)
  const { error } = await supabase
    .from('places')
    .update({ hours: flat })
    .eq('id', placeId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

const DAY_ES: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

function hoursScheduleToLegacyRecord(
  schedule: BusinessHoursSchedule,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, label] of Object.entries(DAY_ES)) {
    const day = schedule[key as keyof BusinessHoursSchedule] as
      | import('./profileTypes').DayHours
      | undefined
    if (!day) continue
    if (day.closed) {
      out[label] = 'Cerrado'
      continue
    }
    if (day.allDay) {
      out[label] = '24 horas'
      continue
    }
    const slot = day.slots?.[0]
    if (slot) out[label] = `${slot.open} – ${slot.close}`
  }
  return out
}
