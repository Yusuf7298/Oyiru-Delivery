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
