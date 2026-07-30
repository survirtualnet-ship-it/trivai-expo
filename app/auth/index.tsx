import { Redirect } from 'expo-router'

/** Legacy route — unified welcome lives at /welcome */
export default function AuthIndexRedirect() {
  return <Redirect href="/welcome" />
}
