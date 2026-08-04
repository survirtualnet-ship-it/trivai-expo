import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { MyBusinessEmptyScreen } from './MyBusinessEmptyScreen'
import { companyTheme as t } from '../theme'

/** Protected entry: Profile → Mi negocio */
export function MyBusinessScreen() {
  const profileCompanyId = useProfileStore(s => s.user.companyId)
  const authCompanyId = useAuthStore(s => s.user?.companyId)
  const companyId = profileCompanyId ?? authCompanyId ?? null

  useEffect(() => {
    if (!companyId) return
    // Always navigate — CompanyProfileScreen hydrates from Supabase if needed
    router.replace(`/empresa/${companyId}`)
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
