import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OnboardingStackParamList } from '../navigation/types'

export type WelcomeProps = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>
export type UserTypeProps = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>

export type TouristInterestsProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'TouristInterests'
>
export type TouristLocationProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'TouristLocation'
>
export type TouristSocialProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'TouristSocial'
>
export type TouristDoneProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'TouristDone'
>

export type BusinessGoogleLoginProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'BusinessGoogleLogin'
>
export type BusinessSearchProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'BusinessSearch'
>
export type BusinessVerifyProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'BusinessVerify'
>
export type BusinessSetupProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'BusinessSetup'
>
export type BusinessDoneProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'BusinessDone'
>

export const INTEREST_OPTIONS = [
  { id: 'food', label: 'Comida', emoji: '🍔' },
  { id: 'nightlife', label: 'Vida nocturna', emoji: '🎶' },
  { id: 'culture', label: 'Cultura', emoji: '🏛' },
  { id: 'nature', label: 'Naturaleza', emoji: '🌄' },
  { id: 'shopping', label: 'Compras', emoji: '🛍' },
  { id: 'events', label: 'Eventos', emoji: '🎉' },
] as const

export const BUSINESS_CATEGORIES = [
  'Gastronomía',
  'Entretenimiento',
  'Turismo',
  'Hotel',
  'Retail',
  'Servicios',
] as const
