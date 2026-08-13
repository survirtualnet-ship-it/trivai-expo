/**
 * Permission matrix — users vs anonymous guests vs businesses (entities).
 * Guests are NOT a role: absence of session = anonymous exploration only.
 */

import type { UserRole } from './user'
import { isBusinessUser, isTouristUser, normalizeUserRole } from './user'
import type { Business } from './business'
import { isBusinessClaimed } from './business'
import { canAccessDashboard } from '@/lib/business/planFeatures'

export type PermissionContext = {
  isAuthenticated: boolean
  role: UserRole | null
  userId: string | null
}

export function createGuestContext(): PermissionContext {
  return { isAuthenticated: false, role: null, userId: null }
}

export function createAuthContext(
  userId: string,
  role: UserRole | string | null,
): PermissionContext {
  return {
    isAuthenticated: true,
    userId,
    role: normalizeUserRole(role),
  }
}

// ─── Guest (anonymous — no User) ─────────────────────────────────────────────

export function guestCanExplore(ctx: PermissionContext): boolean {
  return !ctx.isAuthenticated
}

export function guestCanSearch(ctx: PermissionContext): boolean {
  return !ctx.isAuthenticated
}

export function guestCanViewPlaceDetail(ctx: PermissionContext): boolean {
  return !ctx.isAuthenticated
}

export function guestCanViewEvents(ctx: PermissionContext): boolean {
  return !ctx.isAuthenticated
}

export function guestCanWriteReview(ctx: PermissionContext): boolean {
  return false
}

export function guestCanFavorite(ctx: PermissionContext): boolean {
  return false
}

export function guestCanFollowUsers(ctx: PermissionContext): boolean {
  return false
}

export function guestCanPublishContent(ctx: PermissionContext): boolean {
  return false
}

export function guestCanClaimBusiness(ctx: PermissionContext): boolean {
  return false
}

export function guestCanAccessBusinessDashboard(ctx: PermissionContext): boolean {
  return false
}

// ─── Tourist (authenticated) ───────────────────────────────────────────────────

export function touristCanWriteReview(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated && isTouristUser(ctx.role)
}

export function touristCanFavorite(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

export function touristCanFollowUsers(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

export function touristCanShareActivity(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

export function touristCanReceiveNotifications(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

export function touristCanCustomizePreferences(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

/** Tourists may start claim flow; after claim they become business users. */
export function userCanStartClaimFlow(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

// ─── Business user (authenticated + business permissions) ────────────────────

export function businessUserCanManageBusiness(
  ctx: PermissionContext,
  business: Business,
): boolean {
  if (!ctx.isAuthenticated || !isBusinessUser(ctx.role) || !ctx.userId) return false
  return isBusinessClaimed(business) && business.ownerUserId === ctx.userId
}

export function businessUserCanAccessDashboard(
  ctx: PermissionContext,
  business: Business,
): boolean {
  if (!ctx.userId || !isBusinessClaimed(business) || business.ownerUserId !== ctx.userId) {
    return false
  }
  return canAccessDashboard(business.subscriptionTier)
}

export function businessUserCanExploreAsTourist(ctx: PermissionContext): boolean {
  return ctx.isAuthenticated
}

// ─── Route guards (mobile app — admin excluded) ─────────────────────────────

export function requiresAuthForPath(path: string): boolean {
  const protectedPrefixes = [
    '/publicar',
    '/notificaciones',
    '/legal/accept',
  ]
  return protectedPrefixes.some(p => path.startsWith(p))
}

export function isMobileAppRole(role: UserRole | null): boolean {
  return role === 'tourist' || role === 'business'
}
