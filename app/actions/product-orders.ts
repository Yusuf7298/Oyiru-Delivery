'use server'

import { db, pool } from '@/lib/db'
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
 * Create a new product-based order using the dedicated product_orders table
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

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const timestamp = Date.now()
    const orderId = `order_${timestamp}_${Math.random().toString(36).substring(2, 9)}`

    // Calculate order totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 5.00
    const tax = Math.round((subtotal + deliveryFee) * 0.05 * 100) / 100
    const total = subtotal + deliveryFee + tax

    console.log('[v0] Creating product order:', {
      orderId,
      customerId: userId,
      items: data.items.length,
      subtotal,
      deliveryFee,
      tax,
      total,
    })

    // Insert order into product_orders table
    await client.query(
      `INSERT INTO product_orders (id, "customerId", status, subtotal, "deliveryFee", tax, total, address, phone, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
      [
        orderId,
        userId,
        'pending',
        subtotal,
        deliveryFee,
        tax,
        total,
        data.deliveryAddress,
        data.customerPhoneNumber || '',
      ]
    )

    console.log('[v0] Order created in product_orders table:', orderId)

    // Insert order items and reduce inventory
    for (const item of data.items) {
      const itemId = `oi_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
      
      await client.query(
        `INSERT INTO product_order_items (id, "orderId", "productId", quantity, "unitPrice", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [itemId, orderId, item.productId, item.quantity, item.price]
      )

      console.log(`[v0] Order item added: ${item.name} x${item.quantity}`)

      // Reduce product inventory
      await client.query(
        `UPDATE products SET "stockQuantity" = "stockQuantity" - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      )

      console.log(`[v0] Inventory reduced for ${item.productId}`)
    }

    await client.query('COMMIT')
    console.log('[v0] Order committed successfully:', orderId)

    return {
      success: true,
      orderId,
      message: 'Order created successfully',
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[v0] Error creating product order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    client.release()
  }
}

/**
 * Get order details from product_orders table
 */
export async function getProductOrder(orderId: string) {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated')
  }

  const client = await pool.connect()

  try {
    // Get order
    const orderResult = await client.query(
      `SELECT * FROM product_orders WHERE id = $1 AND "customerId" = $2`,
      [orderId, userId]
    )

    if (orderResult.rows.length === 0) {
      return null
    }

    const order = orderResult.rows[0]

    // Get order items
    const itemsResult = await client.query(
      `SELECT poi.*, p.name, p.image 
       FROM product_order_items poi
       JOIN products p ON poi."productId" = p.id
       WHERE poi."orderId" = $1`,
      [orderId]
    )

    return {
      ...order,
      items: itemsResult.rows,
    }
  } catch (error) {
    console.error('[v0] Error fetching order:', error)
    return null
  } finally {
    client.release()
  }
}

/**
 * Get user's product orders
 */
export async function getUserProductOrders() {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated')
  }

  const client = await pool.connect()

  try {
    const result = await client.query(
      `SELECT * FROM product_orders WHERE "customerId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    )

    return result.rows
  } catch (error) {
    console.error('[v0] Error fetching user orders:', error)
    return []
  } finally {
    client.release()
  }
}
