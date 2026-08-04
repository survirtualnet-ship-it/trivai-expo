import { LEGAL_VERSION } from './version'

export type LegalAcceptanceFields = {
  legal_accepted: boolean | null
  legal_accepted_at: string | null
  legal_version: string | null
}

/** True when profile has accepted the current LEGAL_VERSION. */
export function hasAcceptedCurrentLegal(
  profile: LegalAcceptanceFields | null | undefined,
): boolean {
  if (!profile) return false
  return (
    profile.legal_accepted === true &&
    profile.legal_version === LEGAL_VERSION
  )
}

/** Authenticated users must re-accept when version mismatches or never accepted. */
export function needsLegalAcceptance(
  isAuthenticated: boolean,
  profile: LegalAcceptanceFields | null | undefined,
): boolean {
  if (!isAuthenticated) return false
  return !hasAcceptedCurrentLegal(profile)
}
