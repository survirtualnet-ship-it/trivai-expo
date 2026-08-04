/** Bump when Terms / Privacy / Content Policy change. Forces re-acceptance. */
export const LEGAL_VERSION = '1.0.0'

/** Auto-hide UGC after this many reports (no human moderation). */
export const REPORT_HIDE_THRESHOLD = 3

export type LegalDocId = 'terms' | 'privacy' | 'content-policy'

export type LegalSection = {
  heading: string
  paragraphs: string[]
}

export type LegalDocument = {
  id: LegalDocId
  title: string
  lastUpdated: string
  version: string
  sections: LegalSection[]
}
