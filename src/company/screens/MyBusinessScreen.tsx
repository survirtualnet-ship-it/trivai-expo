import { memo, useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Building2, ChevronRight, Plus } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useUser } from '@/hooks/useUser'
import { useOwnedBusinessesList } from '@/hooks/useOwnedBusinessesList'
import { setActiveBusiness } from '@/lib/business/setActiveBusiness'
import { planBadgeLabel } from '@/lib/business/planOptions'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { MyBusinessEmptyScreen } from './MyBusinessEmptyScreen'
import { companyTheme as t } from '../theme'

export function MyBusinessScreen() {
  const { user, profile } = useUser()
  const activeId = profile?.business_place_id ?? null
  const { items, isLoading, refetch } = useOwnedBusinessesList()

  const openBusiness = useCallback(
    async (placeId: string, name: string, tier: BusinessSubscriptionTier) => {
      if (!user?.id) return
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      try {
        await setActiveBusiness(user.id, placeId, name)
      } catch {
        // still navigate
      }
      if (tier === 'none') {
        router.push({
          pathname: '/(tabs)/empresa-plan',
          params: { placeId, name },
        } as never)
        return
      }
      router.push(`/empresa/${placeId}`)
    },
    [user?.id],
  )

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    )
  }

  if (items.length === 0) {
    return <MyBusinessEmptyScreen />
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis negocios</Text>
        <Text style={styles.subtitle}>
          Administra uno o varios locales. Toca para abrir el panel.
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.placeId}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={() => void refetch()}
        renderItem={({ item }) => (
          <BusinessRow
            name={item.name}
            address={item.address}
            tier={item.subscriptionTier}
            isActive={item.placeId === activeId}
            onPress={() => void openBusiness(item.placeId, item.name, item.subscriptionTier)}
          />
        )}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              router.push('/empresa/onboarding')
            }}
          >
            <Plus size={20} color={t.accent} />
            <Text style={styles.addLabel}>Agregar otro negocio</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  )
}

const BusinessRow = memo(function BusinessRow({
  name,
  address,
  tier,
  isActive,
  onPress,
}: {
  name: string
  address: string
  tier: BusinessSubscriptionTier
  isActive: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isActive && styles.rowActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowIcon}>
        <Building2 size={22} color={isActive ? t.accent : t.textSecondary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>
          {name}
        </Text>
        {address ? (
          <Text style={styles.rowAddress} numberOfLines={1}>
            {address}
          </Text>
        ) : null}
        <View style={styles.badges}>
          <Text style={styles.planBadge}>{planBadgeLabel(tier)}</Text>
          {isActive ? <Text style={styles.activeBadge}>Activo</Text> : null}
        </View>
      </View>
      <ChevronRight size={20} color={t.textMuted} />
    </Pressable>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.bg,
  },
  header: {
    paddingHorizontal: t.spacing.xxl,
    paddingTop: t.spacing.lg,
    paddingBottom: t.spacing.md,
    gap: t.spacing.xs,
  },
  title: {
    color: t.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: t.spacing.lg,
    paddingBottom: t.spacing.xxxl,
    gap: t.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.lg,
    marginBottom: t.spacing.sm,
  },
  rowActive: {
    borderColor: t.accent,
    backgroundColor: t.accentSoft,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: t.radius.md,
    backgroundColor: t.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    color: t.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rowAddress: {
    color: t.textMuted,
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    gap: t.spacing.sm,
    marginTop: 4,
  },
  planBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: t.textSecondary,
    backgroundColor: t.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: t.radius.full,
    overflow: 'hidden',
  },
  activeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: t.accent,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.sm,
    marginTop: t.spacing.md,
    paddingVertical: 14,
    borderRadius: t.radius.full,
    borderWidth: 2,
    borderColor: t.accent,
    borderStyle: 'dashed',
  },
  addLabel: {
    color: t.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
})
