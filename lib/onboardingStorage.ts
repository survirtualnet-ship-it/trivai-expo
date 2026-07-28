import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY_DONE = 'trivai_onboarding_done'
const KEY_BUSINESS = 'trivai_is_business'

export async function getOnboardingDone(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY_DONE)) === '1'
  } catch {
    return false
  }
}

export async function setOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_DONE, '1')
  } catch {}
}

export async function setBusinessIntent(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_BUSINESS, '1')
  } catch {}
}

export async function isBusinessIntent(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY_BUSINESS)) === '1'
  } catch {
    return false
  }
}
