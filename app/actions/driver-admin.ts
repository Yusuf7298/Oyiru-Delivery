'use server'

import { db } from '@/lib/db'
import { deliveries, oyruOrders, deliveryPartners, user, usersProfile } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'

async function ensureAdmin() {
    const auth = await getAuthContext()
    if (!requireAuth(auth) || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
        throw new Error('Forbidden')
    }
    return auth
}

/**
 * Get full driver profile by userId (from users_profile / delivery_partners / user tables)
 */
export async function getDriverProfile(userId: string) {
    try {
        await ensureAdmin()

        // Get user info
        const userRows = await db
            .select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1)

        if (!userRows.length) return { success: false, error: 'User not found' }

        // Get delivery_partner record
        const dpRows = await db
            .select()
            .from(deliveryPartners)
            .where(eq(deliveryPartners.userId, userId))
            .limit(1)

        const dp = dpRows[0] || null

        return {
            success: true,
            driver: {
                // delivery_partners fields
                id: dp?.id || '',
                userId,
                phoneNumber: dp?.phoneNumber || '',
                vehicleType: dp?.vehicleType || null,
                licenseNumber: dp?.licenseNumber || null,
                isVerified: dp?.isVerified ?? false,
                isActive: dp?.isActive ?? false,
                totalOrders: dp?.totalOrders || 0,
                totalEarnings: dp?.totalEarnings || '0',
                averageRating: dp?.averageRating || null,
                birthPlace: (dp as any)?.birthPlace || null,
                guarantorName: (dp as any)?.guarantorName || null,
                guarantorPhone: (dp as any)?.guarantorPhone || null,
                serviceType: (dp as any)?.serviceType || null,
                createdAt: dp?.createdAt || new Date(),
                // user fields
                userName: userRows[0].name,
                userEmail: userRows[0].email,
            },
        }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

/**
 * Get all deliveries assigned to this driver
 */
export async function getDriverDeliveryHistory(userId: string) {
    try {
        await ensureAdmin()

        const rows = await db
            .select({
                deliveryId: deliveries.id,
                orderId: deliveries.orderId,
                deliveryStatus: deliveries.status,
                pickupTime: deliveries.pickupTime,
                deliveryTime: deliveries.deliveryTime,
                createdAt: deliveries.createdAt,
                orderNumber: oyruOrders.orderNumber,
                totalAmount: oyruOrders.totalAmount,
                deliveryAddress: oyruOrders.deliveryAddress,
                orderStatus: oyruOrders.status,
            })
            .from(deliveries)
            .innerJoin(oyruOrders, eq(deliveries.orderId, oyruOrders.id))
            .where(eq(deliveries.driverId, userId))
            .orderBy(desc(deliveries.createdAt))

        return { success: true, deliveries: rows }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

/**
 * Toggle driver active/inactive status
 */
export async function toggleDriverStatus(deliveryPartnerId: string, newStatus: boolean) {
    try {
        await ensureAdmin()

        await db
            .update(deliveryPartners)
            .set({ isActive: newStatus, updatedAt: new Date() })
            .where(eq(deliveryPartners.id, deliveryPartnerId))

        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
