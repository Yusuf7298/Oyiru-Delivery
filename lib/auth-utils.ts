import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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
 * Check if user has a specific role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) return false
  // Role will be fetched from users_profile table
  return true
}
