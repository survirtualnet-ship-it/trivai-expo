import { CompanyProfileScreen } from '@/src/company/CompanyProfileScreen'
import { parseCompanyTab } from '@/src/company/types'
import { useLocalSearchParams } from 'expo-router'

export default function CompanyProfileRoute() {
  const params = useLocalSearchParams<{ id: string | string[]; tab?: string | string[] }>()
  const raw = params.id
  const companyId = Array.isArray(raw) ? raw[0] : raw
  const tabRaw = params.tab
  const tabParam = Array.isArray(tabRaw) ? tabRaw[0] : tabRaw
  const initialTab = parseCompanyTab(tabParam)

  return <CompanyProfileScreen companyId={companyId ?? ''} initialTab={initialTab} />
}
