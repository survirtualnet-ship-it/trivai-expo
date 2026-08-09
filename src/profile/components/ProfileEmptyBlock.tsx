import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { profileTheme } from '../theme'

type Props = {
  title: string
  body: string
  ctaLabel?: string
  onPress?: () => void
}

export const ProfileEmptyBlock = memo(function ProfileEmptyBlock({
  title,
  body,
  ctaLabel,
  onPress,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {ctaLabel && onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    padding: profileTheme.spacing.xl,
    borderRadius: profileTheme.radius.lg,
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.sm,
    alignItems: 'flex-start',
  },
  title: {
    color: profileTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: profileTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  btn: {
    marginTop: profileTheme.spacing.sm,
    backgroundColor: profileTheme.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: profileTheme.radius.full,
  },
  pressed: {
    opacity: 0.9,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})
