import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type UserRole = 'customer' | 'admin' | 'delivery_partner' | 'restaurant_owner' | 'super_admin'

export interface AuthContext {
  userId: string
  email: string
  role: UserRole
  isAuthenticated: boolean
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return null
    }

    const userProfile = await db
      .select()
      .from(usersProfile)
      .where(eq(usersProfile.userId, session.user.id))
      .limit(1)

    const role = (userProfile[0]?.role || 'customer') as UserRole

    return {
      userId: session.user.id,
      email: session.user.email || '',
      role,
      isAuthenticated: true,
    }
  } catch (error) {
    console.error('[v0] Auth context error:', error)
    return null
  }
}

export function requireAuth(auth: AuthContext | null): auth is AuthContext {
  return auth !== null && auth.isAuthenticated
}

export function requireRole(auth: AuthContext | null, allowedRoles: UserRole[]): boolean {
  if (!requireAuth(auth)) return false
  return allowedRoles.includes(auth.role)
}

export function requireAdmin(auth: AuthContext | null): boolean {
  if (!requireAuth(auth)) return false
  return auth.role === 'admin' || auth.role === 'super_admin'
}

export function requireCustomer(auth: AuthContext | null): boolean {
  if (!requireAuth(auth)) return false
  return auth.role === 'customer'
}

export function requireDriver(auth: AuthContext | null): boolean {
  if (!requireAuth(auth)) return false
  return auth.role === 'delivery_partner'
}

export function requireRestaurantOwner(auth: AuthContext | null): boolean {
  if (!requireAuth(auth)) return false
  return auth.role === 'restaurant_owner'
}

export async function apiUnauthorized(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}

export async function apiForbidden(message = 'Forbidden') {
  return Response.json({ error: message }, { status: 403 })
}
