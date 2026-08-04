import { memo, type ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = {
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
  onBack?: () => void
  headerRight?: ReactNode
  contentStyle?: StyleProp<ViewStyle>
}

export const AuthScreenLayout = memo(function AuthScreenLayout({
  children,
  footer,
  centered = false,
  onBack,
  headerRight,
  contentStyle,
}: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          {onBack ? (
            <View style={styles.header}>
              <Pressable
                onPress={onBack}
                style={styles.backBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Volver"
              >
                <ArrowLeft size={22} color={t.accent} strokeWidth={2.25} />
                <Text style={styles.backText}>Volver</Text>
              </Pressable>
              {headerRight}
            </View>
          ) : null}
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              centered && styles.centered,
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.sm,
    paddingBottom: t.spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: t.font.body,
    fontWeight: '600',
    color: t.accent,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: t.spacing.xl,
    paddingBottom: t.spacing.xxl,
    gap: t.spacing.lg,
  },
  centered: {
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: t.spacing.xl,
    paddingBottom: t.spacing.lg,
  },
})
