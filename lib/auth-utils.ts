import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get the current user's ID from the session.
 * Throws an error if the user is not authenticated.
 */
export async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

/**
 * Get the full user session including profile data.
 */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Check if the current user has a specific role.
 * Queries the users_profile table for the actual role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) return false

  const profile = await db
    .select({ role: usersProfile.role })
    .from(usersProfile)
    .where(eq(usersProfile.userId, session.user.id))
    .limit(1)

  return profile[0]?.role === role
}
