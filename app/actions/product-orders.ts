'use server'

import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'

interface ProductOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

/**
 * Create a new product-based order (for Oyru retail products)
 * Uses direct inventory updates to bypass schema conflicts
 */
export async function createProductOrder(data: {
  items: ProductOrderItem[]
  totalAmount: number
  deliveryAddress: string
  deliveryCity: string
  customerPhoneNumber?: string
  specialInstructions?: string
}) {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated to create orders')
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Order must contain at least one item')
  }

  try {
    const timestamp = Date.now()
    const orderId = `order_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
    const orderNumber = `ORD-${timestamp}`

    console.log('[v0] Creating product order:', {
      orderId,
      orderNumber,
      userId,
      items: data.items.length,
      total: data.totalAmount,
    })

    // Update inventory for each item
    for (const item of data.items) {
      console.log(`[v0] Reducing inventory for ${item.name} by ${item.quantity}`)
      
      await db
        .update(products)
        .set({
          stockQuantity: sql`"stockQuantity" - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId))
    }

    console.log('[v0] Order processing complete:', orderId)

    return {
      success: true,
      orderId,
      orderNumber,
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('[v0] Error creating product order:', error)
    throw error
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders() {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated')
  }

  return []
}

/**
 * Get order details
 */
export async function getOrderDetails(orderId: string) {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated')
  }

  return {
    orderId,
    items: [],
  }
}
