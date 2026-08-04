export { LEGAL_VERSION, REPORT_HIDE_THRESHOLD } from './version'
export type { LegalDocId, LegalDocument, LegalSection } from './version'
export { LEGAL_DOCS, getLegalDocument } from './content'
export {
  hasAcceptedCurrentLegal,
  needsLegalAcceptance,
  type LegalAcceptanceFields,
} from './needsLegalAcceptance'
export { acceptLegalTerms, legalAcceptancePayload } from './acceptLegal'
export { reportReview, type ReportReviewResult } from './reportContent'
