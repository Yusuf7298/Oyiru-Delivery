'use server'

import { db } from '@/lib/db'
import { user, usersProfile, oyruOrders, oyruOrderItems, products } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'

async function ensureAdmin() {
    const auth = await getAuthContext()
    if (!requireAuth(auth) || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
        throw new Error('Forbidden')
    }
    return auth
}

export async function getCustomerProfile(userId: string) {
    try {
        await ensureAdmin()

        const userRows = await db.select().from(user).where(eq(user.id, userId)).limit(1)
        if (!userRows.length) return { success: false, error: 'Customer not found' }

        const profileRows = await db.select().from(usersProfile).where(eq(usersProfile.userId, userId)).limit(1)

        return {
            success: true,
            customer: {
                ...userRows[0],
                profile: profileRows[0] || null,
            },
        }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function getCustomerOrders(userId: string) {
    try {
        await ensureAdmin()

        const orders = await db
            .select()
            .from(oyruOrders)
            .where(eq(oyruOrders.userId, userId))
            .orderBy(desc(oyruOrders.createdAt))

        // Fetch items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await db
                    .select({
                        id: oyruOrderItems.id,
                        productId: oyruOrderItems.productId,
                        quantity: oyruOrderItems.quantity,
                        unitPrice: oyruOrderItems.unitPrice,
                        productName: products.name,
                    })
                    .from(oyruOrderItems)
                    .innerJoin(products, eq(oyruOrderItems.productId, products.id))
                    .where(eq(oyruOrderItems.orderId, order.id))

                return { ...order, items }
            })
        )

        return { success: true, orders: ordersWithItems }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function toggleCustomerStatus(userId: string, suspend: boolean) {
    try {
        await ensureAdmin()

        // Update emailVerified as a soft-suspend proxy since there's no `isActive` on user table
        // More correctly update the profile
        await db
            .update(usersProfile)
            .set({ isVerified: !suspend, updatedAt: new Date() })
            .where(eq(usersProfile.userId, userId))

        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
