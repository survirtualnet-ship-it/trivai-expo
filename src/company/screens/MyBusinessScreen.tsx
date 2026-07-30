import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { getCompanyById } from '@/src/company/store/useCompanyProfileStore'
import { MyBusinessEmptyScreen } from './MyBusinessEmptyScreen'
import { companyTheme as t } from '../theme'

/** Protected entry: Profile → Mi negocio */
export function MyBusinessScreen() {
  const companyId = useProfileStore(s => s.user.companyId)

  useEffect(() => {
    if (!companyId) return
    const company = getCompanyById(companyId)
    if (company) {
      router.replace(`/empresa/${companyId}`)
    }
  }, [companyId])

  if (!companyId) {
    return <MyBusinessEmptyScreen />
  }

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={t.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.bg,
  },
})
