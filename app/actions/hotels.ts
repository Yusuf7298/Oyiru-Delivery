'use server'

import { db } from '@/lib/db'
import { hotelAccounts, user, usersProfile, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAuth, requireAdmin } from '@/lib/middleware/role-check'
import { hashSync } from '@node-rs/bcrypt'

export async function createHotelAccount(formData: {
  ownerFullName: string
  hotelName: string
  address: string
  phoneNumber: string
  email: string
  password: string
  agreementStartDate?: string
  agreementEndDate?: string
  basePaymentAmount?: string
  telegramChatId?: string
}) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can create hotel accounts' }
  }

  try {
    const userId = uuidv4()
    const hotelId = uuidv4()
    const hashedPassword = hashSync(formData.password, 10)

    // Create user account
    await db.insert(user).values({
      id: userId,
      name: formData.ownerFullName,
      email: formData.email,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create account (credential-based)
    await db.insert(account).values({
      id: uuidv4(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create user profile with hotel role
    await db.insert(usersProfile).values({
      id: uuidv4(),
      userId,
      role: 'hotel',
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create hotel account
    await db.insert(hotelAccounts).values({
      id: hotelId,
      userId,
      companyName: formData.hotelName,
      contactPerson: formData.ownerFullName,
      ownerFullName: formData.ownerFullName,
      email: formData.email,
      phone: formData.phoneNumber,
      address: formData.address,
      agreementStartDate: formData.agreementStartDate ? new Date(formData.agreementStartDate) : null,
      agreementEndDate: formData.agreementEndDate ? new Date(formData.agreementEndDate) : null,
      basePaymentAmount: formData.basePaymentAmount || null,
      telegramChatId: formData.telegramChatId || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, hotelId, userId }
  } catch (error: any) {
    console.error('[v0] Error creating hotel account:', error)
    if (error.message?.includes('unique')) {
      return { error: 'Email already exists' }
    }
    return { error: 'Failed to create hotel account' }
  }
}

export async function getHotels() {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || !requireAdmin(auth)) {
    return { error: 'Unauthorized' }
  }

  try {
    const hotels = await db.select().from(hotelAccounts).orderBy(hotelAccounts.createdAt)
    return { success: true, hotels }
  } catch (error) {
    console.error('[v0] Error fetching hotels:', error)
    return { error: 'Failed to fetch hotels' }
  }
}

export async function getHotelById(hotelId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) {
    return { error: 'Unauthorized' }
  }

  try {
    const hotel = await db
      .select()
      .from(hotelAccounts)
      .where(eq(hotelAccounts.id, hotelId))
      .limit(1)

    if (!hotel.length) {
      return { error: 'Hotel not found' }
    }

    return { success: true, hotel: hotel[0] }
  } catch (error) {
    console.error('[v0] Error fetching hotel:', error)
    return { error: 'Failed to fetch hotel' }
  }
}

export async function updateHotel(hotelId: string, data: {
  companyName?: string
  ownerFullName?: string
  address?: string
  phone?: string
  email?: string
  agreementStartDate?: string
  agreementEndDate?: string
  basePaymentAmount?: string
  telegramChatId?: string
  isActive?: boolean
}) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can update hotel accounts' }
  }

  try {
    await db
      .update(hotelAccounts)
      .set({
        ...data,
        agreementStartDate: data.agreementStartDate ? new Date(data.agreementStartDate) : undefined,
        agreementEndDate: data.agreementEndDate ? new Date(data.agreementEndDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(hotelAccounts.id, hotelId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating hotel:', error)
    return { error: 'Failed to update hotel' }
  }
}

export async function toggleHotelStatus(hotelId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can change hotel status' }
  }

  try {
    const hotel = await db.select().from(hotelAccounts).where(eq(hotelAccounts.id, hotelId)).limit(1)
    if (!hotel.length) return { error: 'Hotel not found' }

    await db
      .update(hotelAccounts)
      .set({ isActive: !hotel[0].isActive, updatedAt: new Date() })
      .where(eq(hotelAccounts.id, hotelId))

    return { success: true, isActive: !hotel[0].isActive }
  } catch (error) {
    console.error('[v0] Error toggling hotel status:', error)
    return { error: 'Failed to toggle hotel status' }
  }
}

export async function deleteHotel(hotelId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can delete hotel accounts' }
  }

  try {
    const hotel = await db.select().from(hotelAccounts).where(eq(hotelAccounts.id, hotelId)).limit(1)
    if (!hotel.length) return { error: 'Hotel not found' }

    // Deleting the user will cascade delete the hotelAccount, usersProfile, account, etc.
    if (hotel[0].userId) {
      await db.delete(user).where(eq(user.id, hotel[0].userId))
    } else {
      await db.delete(hotelAccounts).where(eq(hotelAccounts.id, hotelId))
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting hotel:', error)
    return { error: 'Failed to delete hotel' }
  }
}

