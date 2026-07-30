import { ONBOARDING_CONFIG } from './config'

export type GoogleAuthUser = {
  id: string
  email: string
  name: string
  picture?: string
}

/**
 * Google Sign-In via expo-auth-session when available.
 * Falls back to mock user for isolated onboarding demo.
 */
export async function signInWithGoogle(): Promise<GoogleAuthUser> {
  try {
    const AuthSession = await import('expo-auth-session')
    const WebBrowser = await import('expo-web-browser')

    WebBrowser.maybeCompleteAuthSession()

    const clientId = ONBOARDING_CONFIG.googleWebClientId
    if (!clientId) {
      return mockGoogleUser()
    }

    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'trivai' })
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }

    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
    })

    const result = await request.promptAsync(discovery)

    if (result.type !== 'success' || !result.authentication?.accessToken) {
      throw new Error('Google sign-in cancelled')
    }

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
      },
    )
    const profile = (await profileRes.json()) as {
      sub: string
      email: string
      name: string
      picture?: string
    }

    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    }
  } catch {
    return mockGoogleUser()
  }
}

function mockGoogleUser(): GoogleAuthUser {
  return {
    id: 'mock-google-user',
    email: 'negocio@gmail.com',
    name: 'María Emprendedora',
    picture: undefined,
  }
}

export function verifyBusinessEmail(
  googleEmail: string,
  businessWebsite?: string,
): 'approved' | 'pending' {
  const domain = googleEmail.split('@')[1]?.toLowerCase() ?? ''
  const freeDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com']
  if (freeDomains.includes(domain)) return 'pending'
  if (businessWebsite && domain.length > 3) {
    const siteDomain = businessWebsite
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .toLowerCase()
    if (siteDomain.includes(domain.replace('.com', ''))) return 'approved'
  }
  return domain.endsWith('.com.bo') || domain.endsWith('.bo') ? 'approved' : 'pending'
}
