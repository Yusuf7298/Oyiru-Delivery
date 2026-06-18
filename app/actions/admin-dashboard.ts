'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { usersProfile, orders, restaurants, deliveryPartners, dailyAnalytics, user } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Dashboard Statistics
export async function getDashboardStats() {
  const userId = await getUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalOrders,
    totalCustomers,
    totalRestaurants,
    totalDeliveryPartners,
    todayOrders,
    todayRevenue,
  ] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(orders),
    db
      .select({ count: sql`COUNT(*)` })
      .from(usersProfile)
      .where(eq(usersProfile.role, 'customer')),
    db
      .select({ count: sql`COUNT(*)` })
      .from(restaurants),
    db
      .select({ count: sql`COUNT(*)` })
      .from(deliveryPartners),
    db
      .select({ count: sql`COUNT(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today)),
    db
      .select({
        total: sql`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, today)),
  ])

  return {
    totalOrders: Number(totalOrders[0]?.count || 0),
    totalCustomers: Number(totalCustomers[0]?.count || 0),
    totalRestaurants: Number(totalRestaurants[0]?.count || 0),
    totalDeliveryPartners: Number(totalDeliveryPartners[0]?.count || 0),
    todayOrders: Number(todayOrders[0]?.count || 0),
    todayRevenue: Number(todayRevenue[0]?.total || 0),
  }
}

// Get recent orders
export async function getRecentOrders(limit = 10) {
  const userId = await getUserId()

  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
}

// Get all customers
export async function getAllCustomers(page = 1, limit = 20) {
  const userId = await getUserId()
  const offset = (page - 1) * limit

  const customers = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.role, 'customer'))
    .orderBy(desc(usersProfile.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(usersProfile)
    .where(eq(usersProfile.role, 'customer'))

  return {
    customers,
    total: Number(countResult[0]?.count || 0),
    pages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}

// Get all restaurants
export async function getAllRestaurants(page = 1, limit = 20) {
  const userId = await getUserId()
  const offset = (page - 1) * limit

  const restaurantsList = await db
    .select()
    .from(restaurants)
    .orderBy(desc(restaurants.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(restaurants)

  return {
    restaurants: restaurantsList,
    total: Number(countResult[0]?.count || 0),
    pages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}

// Get all delivery partners
export async function getAllDeliveryPartners(page = 1, limit = 20) {
  const userId = await getUserId()
  const offset = (page - 1) * limit

  const partners = await db
    .select()
    .from(deliveryPartners)
    .orderBy(desc(deliveryPartners.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(deliveryPartners)

  return {
    partners,
    total: Number(countResult[0]?.count || 0),
    pages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}

// Update order status
export async function updateOrderStatusAdmin(orderId: string, newStatus: string) {
  const userId = await getUserId()

  await db
    .update(orders)
    .set({ status: newStatus as any, updatedAt: new Date() })
    .where(eq(orders.id, orderId))

  return { success: true }
}

// Suspend restaurant
export async function suspendRestaurant(restaurantId: string, reason: string) {
  const userId = await getUserId()

  await db
    .update(restaurants)
    .set({ isActive: false })
    .where(eq(restaurants.id, restaurantId))

  return { success: true }
}

// Suspend delivery partner
export async function suspendDeliveryPartner(partnerId: string, reason: string) {
  const userId = await getUserId()

  await db
    .update(deliveryPartners)
    .set({ isActive: false })
    .where(eq(deliveryPartners.id, partnerId))

  return { success: true }
}

// Get analytics data
export async function getAnalyticsData(days = 30) {
  const userId = await getUserId()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const analyticsData = await db
    .select()
    .from(dailyAnalytics)
    .where(gte(dailyAnalytics.createdAt, startDate))
    .orderBy(desc(dailyAnalytics.date))

  return analyticsData
}

// Get order by ID
export async function getOrderById(orderId: string) {
  const userId = await getUserId()

  return db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .then((result) => result[0])
}
