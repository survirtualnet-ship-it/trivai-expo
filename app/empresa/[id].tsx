import { CompanyProfileScreen } from '@/src/company/CompanyProfileScreen'
import { useLocalSearchParams } from 'expo-router'

export default function CompanyProfileRoute() {
  const params = useLocalSearchParams<{ id: string | string[] }>()
  const raw = params.id
  const companyId = Array.isArray(raw) ? raw[0] : raw
  return <CompanyProfileScreen companyId={companyId ?? ''} />
}
