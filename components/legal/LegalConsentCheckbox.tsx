import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Check } from 'lucide-react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  /** Light auth screens use onboarding dark theme by default */
  variant?: 'dark' | 'light'
}

export function LegalConsentCheckbox({
  checked,
  onChange,
  variant = 'dark',
}: Props) {
  const isDark = variant === 'dark'
  const textColor = isDark ? t.textSecondary : '#64748b'
  const linkColor = isDark ? t.accent : '#7c3aed'
  const boxBg = checked ? (isDark ? t.accent : '#7c3aed') : 'transparent'
  const boxBorder = checked
    ? boxBg
    : isDark
      ? t.border
      : '#cbd5e1'

  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, { backgroundColor: boxBg, borderColor: boxBorder }]}>
        {checked ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
      </View>
      <Text style={[styles.label, { color: textColor }]}>
        He leído y acepto los{' '}
        <Text
          style={[styles.link, { color: linkColor }]}
          onPress={() => router.push('/legal/terms')}
        >
          Términos
        </Text>
        {' '}y la{' '}
        <Text
          style={[styles.link, { color: linkColor }]}
          onPress={() => router.push('/legal/privacy')}
        >
          Política de Privacidad
        </Text>
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})
