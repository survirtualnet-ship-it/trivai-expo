import { CompanyProfileScreen } from '@/src/company/CompanyProfileScreen'
import { useLocalSearchParams } from 'expo-router'

export default function CompanyProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <CompanyProfileScreen companyId={id ?? ''} />
}
