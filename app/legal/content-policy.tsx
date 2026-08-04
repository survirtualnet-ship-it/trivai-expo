import { LegalDocumentScreen } from '@/components/legal/LegalDocumentScreen'
import { getLegalDocument } from '@/lib/legal'

export default function LegalContentPolicyScreen() {
  return <LegalDocumentScreen document={getLegalDocument('content-policy')} />
}
