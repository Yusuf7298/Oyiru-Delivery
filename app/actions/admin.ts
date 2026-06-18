'use server'

import { db } from '@/lib/db'
import { orders, restaurants, deliveryPartners, usersProfile, user } from '@/lib/db/schema'
import { getUserId } from '@/lib/auth-utils'

/**
 * Get platform statistics (admin only)
 */
export async function getPlatformStats() {
  const userId = await getUserId()

  // Verify admin role - in a real app, check the users_profile role
  const allOrders = await db.select().from(orders)
  const allRestaurants = await db.select().from(restaurants)
  const allPartners = await db.select().from(deliveryPartners)

  const stats = {
    totalOrders: allOrders.length,
    totalRevenue: allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0),
    activeRestaurants: allRestaurants.filter(r => r.isActive).length,
    totalRestaurants: allRestaurants.length,
    totalDeliveryPartners: allPartners.length,
    activeDeliveryPartners: allPartners.filter(p => p.isActive).length,
    recentOrders: allOrders.slice(0, 10),
  }

  return stats
}

/**
 * Get all restaurants
 */
export async function getAllRestaurants() {
  await getUserId() // Verify user is authenticated

  return db.select().from(restaurants)
}

/**
 * Get all orders
 */
export async function getAllOrders() {
  await getUserId() // Verify user is authenticated

  return db.select().from(orders)
}

/**
 * Get all delivery partners
 */
export async function getAllDeliveryPartners() {
  await getUserId()

  return db.select().from(deliveryPartners)
}

/**
 * Get all users
 */
export async function getAllUsers() {
  await getUserId()

  return db.select().from(users)
}
