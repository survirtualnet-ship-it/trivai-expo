import { memo, useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { tabAllowedForTier } from '@/lib/business/planFeatures'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { companyTheme as t } from '../theme'
import type { CompanyTab } from '../types'

const BASE_TABS: { id: CompanyTab; label: string }[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'products', label: 'Productos' },
  { id: 'gallery', label: 'Galería' },
  { id: 'reviews', label: 'Reseñas' },
  { id: 'dashboard', label: 'Dashboard' },
]

type Props = {
  active: CompanyTab
  tier: BusinessSubscriptionTier
  isOwner: boolean
  onSelect: (tab: CompanyTab) => void
}

export const ProfileTabs = memo(function ProfileTabs({
  active,
  tier,
  isOwner,
  onSelect,
}: Props) {
  const tabs = useMemo(() => {
    if (!isOwner) {
      return BASE_TABS.filter(tab => tab.id !== 'dashboard')
    }
    return BASE_TABS.filter(tab => tabAllowedForTier(tab.id, tier))
  }, [isOwner, tier])

  if (tabs.length === 0) return null

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              void Haptics.selectionAsync()
              onSelect(tab.id)
            }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: t.spacing.lg,
    gap: t.spacing.sm,
    paddingVertical: t.spacing.md,
  },
  tab: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 10,
    borderRadius: t.radius.full,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
  },
  tabActive: {
    backgroundColor: t.accentSoft,
    borderColor: t.accent,
  },
  label: {
    color: t.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: t.accent,
    fontWeight: '700',
  },
})
