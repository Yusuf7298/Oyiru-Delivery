'use server'

import { db } from '@/lib/db'
import { oyruOrders, hotelAccounts, products, categories_oyru } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

/**
 * Get platform statistics (admin only)
 */
export async function getPlatformStats() {
  try {
    // Get all orders
    const allOrders = await db.select().from(oyruOrders)
    const ordersCount = allOrders.length
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0)

    // Get hotels
    const allHotels = await db.select().from(hotelAccounts)

    // Get products
    const allProducts = await db.select().from(products)
    const lowStockProducts = allProducts.filter(p => p.stockQuantity < 10).length

    const stats = {
      totalOrders: ordersCount,
      totalRevenue: totalRevenue,
      activeHotels: allHotels.length,
      totalProducts: allProducts.length,
      lowStockItems: lowStockProducts,
      recentOrders: allOrders.slice(-5),
    }

    return stats
  } catch (error) {
    console.error('[v0] Error getting platform stats:', error)
    return {
      totalOrders: 0,
      totalRevenue: 0,
      activeHotels: 0,
      totalProducts: 0,
      lowStockItems: 0,
      recentOrders: [],
    }
  }
}

/**
 * Get all hotels
 */
export async function getAllHotels() {
  try {
    return await db.select().from(hotelAccounts)
  } catch (error) {
    console.error('[v0] Error getting hotels:', error)
    return []
  }
}

/**
 * Get all orders
 */
export async function getAllOrders() {
  try {
    return await db.select().from(oyruOrders)
  } catch (error) {
    console.error('[v0] Error getting orders:', error)
    return []
  }
}

/**
 * Get all products
 */
export async function getAllProducts() {
  try {
    return await db.select().from(products)
  } catch (error) {
    console.error('[v0] Error getting products:', error)
    return []
  }
}

/**
 * Get product categories
 */
export async function getCategories() {
  try {
    return await db.select().from(categories_oyru)
  } catch (error) {
    console.error('[v0] Error getting categories:', error)
    return []
  }
}

/**
 * Get order by ID (Admin)
 */
export async function getOrderByIdAdmin(orderId: string) {
  try {
    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order) return null

    // Get items using standard select since we need to join products
    const { oyruOrderItems } = await import('@/lib/db/schema')
    const items = await db.select({
      id: oyruOrderItems.id,
      productId: oyruOrderItems.productId,
      quantity: oyruOrderItems.quantity,
      unitPrice: oyruOrderItems.unitPrice,
      name: products.name,
      image: products.image
    })
    .from(oyruOrderItems)
    .innerJoin(products, eq(oyruOrderItems.productId, products.id))
    .where(eq(oyruOrderItems.orderId, orderId))

    return {
      ...order,
      items
    }
  } catch (error) {
    console.error('Error fetching order for admin:', error)
    return null
  }
}

/**
 * Update Oyru Order Status (Admin)
 */
export async function updateOyruOrderStatus(orderId: string, status: string) {
  try {
    const updated = await db
      .update(oyruOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))
      .returning()

    return { success: true, order: updated[0] }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

/**
 * Create Staff Account (Super Admin Only)
 */
export async function createStaffAccount(data: any) {
  const { auth } = await import('@/lib/auth')
  const { headers } = await import('next/headers')
  const { user, usersProfile } = await import('@/lib/db/schema')
  const { getSession } = await import('@/lib/auth-utils')

  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, session.user.id)
  })

  if (profile?.role !== 'super_admin') {
    throw new Error('Forbidden: Only Super Admins can create staff accounts')
  }

  try {
    // We cannot easily call auth.api.signUpEmail from here because it expects full context.
    // However, since we are admin, we can insert the user directly and hash password,
    // OR just use fetch to the API. 
    // Wait, Better Auth server-side API:
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name
      },
      headers: await headers()
    })

    if (res?.user) {
      // Update their profile to the chosen role
      await db.update(usersProfile)
        .set({ role: data.role as any })
        .where(eq(usersProfile.userId, res.user.id))

      return { success: true }
    } else {
      throw new Error('Failed to create account via auth')
    }
  } catch (error: any) {
    console.error('Error creating staff account:', error)
    return { success: false, error: error.message || 'Failed to create account' }
  }
}
