'use server'

import { db } from '@/lib/db'
import { usersProfile } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getUserId, getSession } from '@/lib/auth-utils'

/**
 * Get user profile
 */
export async function getUserProfile() {
  const userId = await getUserId()

  const profile = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.userId, userId))
    .limit(1)

  return profile[0] || null
}

/**
 * Create or update user profile
 */
export async function updateUserProfile(data: {
  role?: string
  phoneNumber?: string
  address?: string
  city?: string
  zipCode?: string
  profileImageUrl?: string
}) {
  const userId = await getUserId()
  const session = await getSession()

  if (!session?.user) throw new Error('Unauthorized')

  // Check if profile exists
  const existingProfile = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.userId, userId))
    .limit(1)

  if (existingProfile.length) {
    const updated = await db
      .update(usersProfile)
      .set(data)
      .where(eq(usersProfile.userId, userId))
      .returning()

    return updated[0]
  } else {
    // Create new profile
    const profileId = `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const [newProfile] = await db
      .insert(usersProfile)
      .values({
        id: profileId,
        userId,
        role: data.role || 'customer',
        phoneNumber: data.phoneNumber,
        address: data.address,
        city: data.city,
        zipCode: data.zipCode,
        profileImageUrl: data.profileImageUrl,
      })
      .returning()

    return newProfile
  }
}

/**
 * Set user role
 */
export async function setUserRole(role: 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin') {
  const userId = await getUserId()

  const profile = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.userId, userId))
    .limit(1)

  if (!profile.length) {
    // Create profile with role
    const profileId = `prof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const [newProfile] = await db
      .insert(usersProfile)
      .values({
        id: profileId,
        userId,
        role,
      })
      .returning()

    return newProfile
  } else {
    // Update existing profile
    const [updated] = await db
      .update(usersProfile)
      .set({ role })
      .where(eq(usersProfile.userId, userId))
      .returning()

    return updated
  }
}
