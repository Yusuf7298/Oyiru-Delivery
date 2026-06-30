'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { usersProfile, orders, restaurants, deliveryPartners, dailyAnalytics, user, supportTickets, oyruOrders } from '@/lib/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  // Enforce admin role
  const profile = await db
    .select()
    .from(usersProfile)
    .where(eq(usersProfile.userId, session.user.id))
    .limit(1)

  if (profile[0]?.role !== 'admin' && profile[0]?.role !== 'super_admin') {
    throw new Error('Forbidden: Admin access required')
  }

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

// Dashboard stats with real period comparison
export async function getDashboardStatsWithTrend() {
  const userId = await getUserId()

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const periodStart = new Date(now); periodStart.setDate(now.getDate() - 30)
  const prevPeriodStart = new Date(now); prevPeriodStart.setDate(now.getDate() - 60)
  const prevPeriodEnd = new Date(now); prevPeriodEnd.setDate(now.getDate() - 30)

  const [
    currentOrders,
    prevOrders,
    currentRevenue,
    prevRevenue,
    totalCustomers,
    prevCustomers,
    todayOrdersCount,
    todayRevenueCount,
  ] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(oyruOrders).where(gte(oyruOrders.createdAt, periodStart)),
    db.select({ count: sql`COUNT(*)` }).from(oyruOrders).where(and(gte(oyruOrders.createdAt, prevPeriodStart), lte(oyruOrders.createdAt, prevPeriodEnd))),
    db.select({ total: sql`COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0)` }).from(oyruOrders).where(gte(oyruOrders.createdAt, periodStart)),
    db.select({ total: sql`COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0)` }).from(oyruOrders).where(and(gte(oyruOrders.createdAt, prevPeriodStart), lte(oyruOrders.createdAt, prevPeriodEnd))),
    db.select({ count: sql`COUNT(*)` }).from(usersProfile).where(eq(usersProfile.role, 'customer')),
    db.select({ count: sql`COUNT(*)` }).from(usersProfile).where(and(eq(usersProfile.role, 'customer'), lte(usersProfile.createdAt, prevPeriodEnd))),
    db.select({ count: sql`COUNT(*)` }).from(oyruOrders).where(gte(oyruOrders.createdAt, todayStart)),
    db.select({ total: sql`COALESCE(SUM(CAST("totalAmount" AS NUMERIC)), 0)` }).from(oyruOrders).where(gte(oyruOrders.createdAt, todayStart)),
  ])

  const currOrders = Number(currentOrders[0]?.count || 0)
  const prevOrd = Number(prevOrders[0]?.count || 0)
  const currRev = Number(currentRevenue[0]?.total || 0)
  const prevRev = Number(prevRevenue[0]?.total || 0)
  const currCustomers = Number(totalCustomers[0]?.count || 0)
  const prevCust = Number(prevCustomers[0]?.count || 0)

  const pct = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

  return {
    totalOrders: currOrders,
    totalRevenue: currRev,
    totalCustomers: currCustomers,
    todayOrders: Number(todayOrdersCount[0]?.count || 0),
    todayRevenue: Number(todayRevenueCount[0]?.total || 0),
    avgOrderValue: currOrders > 0 ? currRev / currOrders : 0,
    trends: {
      orders: pct(currOrders, prevOrd),
      revenue: pct(currRev, prevRev),
      customers: pct(currCustomers, prevCust),
      avgOrderValue: currOrders > 0 && prevOrd > 0
        ? pct(currRev / currOrders, prevRev / prevOrd)
        : 0,
    },
  }
}

// Get all support tickets from DB
export async function getAllSupportTickets(page = 1, limit = 20) {
  const userId = await getUserId()
  const offset = (page - 1) * limit

  const ticketsList = await db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(supportTickets)

  return {
    tickets: ticketsList,
    total: Number(countResult[0]?.count || 0),
    pages: Math.ceil(Number(countResult[0]?.count || 0) / limit),
  }
}

// Update support ticket status
export async function updateSupportTicketStatus(ticketId: string, status: string) {
  const userId = await getUserId()

  await db
    .update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTickets.id, ticketId))

  return { success: true }
}
