export type AuthRole = 'tourist' | 'company'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: AuthRole
  companyId?: string
}

export type LoginPayload = AuthUser & {
  token?: string
}
