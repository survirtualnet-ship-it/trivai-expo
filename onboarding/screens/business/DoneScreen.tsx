import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useCompanyProfileStore } from '@/src/company/store/useCompanyProfileStore'
import { companyFromBusinessData } from '@/src/company/utils/fromOnboarding'
import { useUser } from '@/hooks/useUser'
import { completeBusinessOnboarding } from '@/lib/appBootstrap'
import { onboardingTheme as t } from '../../lib/theme'
import type { BusinessDoneProps } from '../types'

export function BusinessDoneScreen(_props: BusinessDoneProps) {
  const businessData = useOnboardingStore(s => s.businessData)
  const googleUser = useOnboardingStore(s => s.googleUser)
  const registerCompany = useCompanyProfileStore(s => s.registerCompany)
  const loadCompany = useCompanyProfileStore(s => s.loadCompany)
  const setActiveTab = useCompanyProfileStore(s => s.setActiveTab)
  const { user, profile } = useUser()
  const [finishing, setFinishing] = useState(false)

  const handleFinish = async () => {
    if (!businessData || !user?.id || finishing) return
    setFinishing(true)
    try {
      const company = companyFromBusinessData(
        businessData,
        googleUser?.email ?? user.email,
      )
      registerCompany(company)
      loadCompany(company.id)
      setActiveTab('dashboard')

      await completeBusinessOnboarding({
        userId: user.id,
        email: user.email,
        name: profile?.full_name ?? user.email?.split('@')[0],
        companyId: company.id,
        businessName: businessData.name,
      })
    } finally {
      setFinishing(false)
    }
  }

  return (
    <OnboardingLayout
      centered
      footer={
        <PrimaryButton
          label="Ir al panel"
          loading={finishing}
          onPress={handleFinish}
        />
      }
    >
      <View style={styles.wrap}>
        <Text style={styles.emoji}>🚀</Text>
        <Text style={styles.title}>Empieza a recibir turistas ahora</Text>
        <Text style={styles.subtitle}>
          Tu negocio {businessData?.name ?? ''} ya está en camino de aparecer para viajeros cerca de ti.
        </Text>
        {businessData?.verificationStatus === 'pending' ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Verificación pendiente — te avisaremos por correo.
            </Text>
          </View>
        ) : null}
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.lg,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    color: t.text,
    fontSize: t.font.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: t.font.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  banner: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
    padding: t.spacing.lg,
    marginTop: t.spacing.md,
  },
  bannerText: {
    color: t.warning,
    fontSize: t.font.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
})
