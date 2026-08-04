import { supabase } from '@/lib/supabase'
import { LEGAL_VERSION } from './version'

export type AcceptLegalResult = {
  ok: boolean
  error?: string
}

/** Persist consent for the current legal version. */
export async function acceptLegalTerms(userId: string): Promise<AcceptLegalResult> {
  if (!userId) return { ok: false, error: 'Usuario no autenticado' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({
      legal_accepted: true,
      legal_accepted_at: now,
      legal_version: LEGAL_VERSION,
      updated_at: now,
    })
    .eq('id', userId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export function legalAcceptancePayload() {
  return {
    legal_accepted: true,
    legal_accepted_at: new Date().toISOString(),
    legal_version: LEGAL_VERSION,
  }
}
