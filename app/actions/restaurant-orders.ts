'use server'

import { db } from '@/lib/db'
import { orders, restaurants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'

/**
 * Get all orders for a restaurant owner
 */
export async function getRestaurantOrders(restaurantId?: string) {
  const userId = await getUserId()

  let query = db
    .select()
    .from(orders)
    .where(restaurantId ? eq(orders.restaurantId, restaurantId) : undefined)

  // If no restaurantId, get the user's restaurants first
  if (!restaurantId) {
    const userRestaurants = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.userId, userId))

    if (userRestaurants.length === 0) {
      return []
    }

    const restaurantIds = userRestaurants.map(r => r.id)
    query = db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restaurantIds[0]))
  }

  return query
}

/**
 * Get restaurant owner's restaurants
 */
export async function getRestaurantOwnerRestaurants() {
  const userId = await getUserId()

  return db
    .select()
    .from(restaurants)
    .where(eq(restaurants.userId, userId))
}

/**
 * Get order statistics for a restaurant
 */
export async function getOrderStatistics(restaurantId: string) {
  const userId = await getUserId()

  // Verify ownership
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .limit(1)

  if (!restaurant.length) throw new Error('Unauthorized')

  const restaurantOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.restaurantId, restaurantId))

  const stats = {
    totalOrders: restaurantOrders.length,
    completedOrders: restaurantOrders.filter(o => o.status === 'delivered').length,
    pendingOrders: restaurantOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    cancelledOrders: restaurantOrders.filter(o => o.status === 'cancelled').length,
    totalRevenue: restaurantOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
  }

  return stats
}

/**
 * Update order status from restaurant side
 */
export async function updateOrderStatusFromRestaurant(orderId: string, status: string, restaurantId: string) {
  const userId = await getUserId()

  // Verify ownership
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.userId, userId)))
    .limit(1)

  if (!restaurant.length) throw new Error('Unauthorized')

  const updated = await db
    .update(orders)
    .set({ status: status as any })
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurantId)))
    .returning()

  return updated[0]
}
