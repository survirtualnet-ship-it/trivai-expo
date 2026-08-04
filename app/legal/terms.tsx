import { LegalDocumentScreen } from '@/components/legal/LegalDocumentScreen'
import { getLegalDocument } from '@/lib/legal'

export default function LegalTermsScreen() {
  return <LegalDocumentScreen document={getLegalDocument('terms')} />
}
