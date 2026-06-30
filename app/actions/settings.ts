'use server'

import { db } from '@/lib/db'
import { adminSettings } from '@/lib/db/schema'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'
import { v4 as uuidv4 } from 'uuid'

export async function getAdminSettings() {
    const authContext = await getAuthContext()
    if (!authContext || !requireAdmin(authContext)) throw new Error('Forbidden')

    const rows = await db.select().from(adminSettings).limit(1)
    if (rows.length === 0) return null
    return rows[0]
}

export async function saveAdminSettings(data: {
    platformCommission: number
    minDeliveryFee: number
    maxDeliveryDistance: number
    supportEmail: string
    supportPhone: string
}) {
    const authContext = await getAuthContext()
    if (!authContext || !requireAdmin(authContext)) throw new Error('Forbidden')

    const existing = await db.select().from(adminSettings).limit(1)

    if (existing.length > 0) {
        await db
            .update(adminSettings)
            .set({
                platformCommissionPercentage: data.platformCommission.toString(),
                minDeliveryFee: data.minDeliveryFee.toString(),
                maxDeliveryDistance: data.maxDeliveryDistance.toString(),
                supportEmail: data.supportEmail,
                supportPhoneNumber: data.supportPhone,
                updatedAt: new Date(),
            })

        return { success: true }
    } else {
        await db
            .insert(adminSettings)
            .values({
                id: uuidv4(),
                platformCommissionPercentage: data.platformCommission.toString(),
                minDeliveryFee: data.minDeliveryFee.toString(),
                maxDeliveryDistance: data.maxDeliveryDistance.toString(),
                supportEmail: data.supportEmail,
                supportPhoneNumber: data.supportPhone,
            })

        return { success: true }
    }
}
