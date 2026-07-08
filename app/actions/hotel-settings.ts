'use server'

import { db } from '@/lib/db'
import { hotelAccounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'

export async function getHotelSettings() {
    const auth = await getAuthContext()
    if (!auth || !requireRestaurantOwner(auth)) throw new Error('Unauthorized')

    const rows = await db
        .select()
        .from(hotelAccounts)
        .where(eq(hotelAccounts.userId, auth.userId))
        .limit(1)

    return rows[0] || null
}

export async function saveHotelSettings(data: {
    companyName: string
    contactPerson: string
    phone: string
    email: string
    address: string
    billingType: string
}) {
    const auth = await getAuthContext()
    if (!auth || !requireRestaurantOwner(auth)) throw new Error('Unauthorized')

    const existing = await db
        .select({ id: hotelAccounts.id })
        .from(hotelAccounts)
        .where(eq(hotelAccounts.userId, auth.userId))
        .limit(1)

    if (existing.length) {
        await db
            .update(hotelAccounts)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(hotelAccounts.id, existing[0].id))
    } else {
        // Create hotel account if it doesn't exist
        await db.insert(hotelAccounts).values({
            id: `hot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: auth.userId,
            ...data,
        })
    }

    return { success: true }
}
