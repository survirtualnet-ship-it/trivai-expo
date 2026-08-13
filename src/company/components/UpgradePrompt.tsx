import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Lock } from 'lucide-react-native'
import { companyTheme as t } from '../theme'

type Props = {
  message: string
  placeId?: string
  actionLabel?: string
}

export function UpgradePrompt({
  message,
  placeId,
  actionLabel = 'Ver planes',
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Lock size={22} color={t.accent} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {placeId ? (
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={() =>
            router.push({
              pathname: '/empresa/plan',
              params: { placeId },
            } as never)
          }
        >
          <Text style={styles.btnLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xxl,
    gap: t.spacing.md,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: t.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: t.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  btn: {
    marginTop: t.spacing.sm,
    borderWidth: 2,
    borderColor: t.accent,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 10,
    borderRadius: t.radius.full,
  },
  btnLabel: {
    color: t.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: { opacity: 0.9 },
})
