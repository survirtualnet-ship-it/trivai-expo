import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useAppMode } from '@/src/appMode'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { isBusinessUser } from '@/lib/domain/user'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  /** Compact for headers */
  compact?: boolean
}

/**
 * Explore / Business mode switch — only for claimed company accounts.
 * Changes global state only; does not navigate.
 */
export const AppModeToggle = memo(function AppModeToggle({ compact }: Props) {
  const role = useProfileStore(s => s.user.role)
  const activeBusinessId =
    useProfileStore(s => s.user.activeBusinessId ?? s.user.companyId)
  const showToggle = isBusinessUser(role) && !!activeBusinessId
  const { mode, setMode } = useAppMode()

  if (!showToggle) return null

  return (
    <View
      style={[styles.wrap, compact && styles.wrapCompact]}
      accessibilityRole="tablist"
    >
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === 'explore' }}
        onPress={() => {
          void Haptics.selectionAsync()
          setMode('explore')
        }}
        style={[styles.tab, mode === 'explore' && styles.tabActive]}
      >
        <Text style={[styles.label, mode === 'explore' && styles.labelActive]}>
          Explorar
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: mode === 'business' }}
        onPress={() => {
          void Haptics.selectionAsync()
          setMode('business')
        }}
        style={[styles.tab, mode === 'business' && styles.tabActiveBusiness]}
      >
        <Text
          style={[
            styles.label,
            mode === 'business' && styles.labelActiveBusiness,
          ]}
        >
          Mi negocio
        </Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: T.muted,
    borderRadius: R.full,
    padding: 3,
    gap: 2,
  },
  wrapCompact: {
    alignSelf: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: S.md,
    borderRadius: R.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: T.surface,
  },
  tabActiveBusiness: {
    backgroundColor: T.primary,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg2,
  },
  labelActive: {
    color: T.fg1,
    fontFamily: FONT.bold,
  },
  labelActiveBusiness: {
    color: T.surface,
    fontFamily: FONT.bold,
  },
})
