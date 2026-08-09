import { Stack } from 'expo-router'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

export default function BusinessOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.bg },
        animation: 'slide_from_right',
      }}
    />
  )
}
