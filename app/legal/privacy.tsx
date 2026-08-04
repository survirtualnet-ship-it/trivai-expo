import { LegalDocumentScreen } from '@/components/legal/LegalDocumentScreen'
import { getLegalDocument } from '@/lib/legal'

export default function LegalPrivacyScreen() {
  return <LegalDocumentScreen document={getLegalDocument('privacy')} />
}
