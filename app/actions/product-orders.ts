'use server'

import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems, products } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'
import { v4 as uuidv4 } from 'uuid'

interface ProductOrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

/**
 * Create a new product-based order using the oyruOrders table
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
    const orderId = uuidv4()
    const orderNumber = `ORD-${timestamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Calculate order totals
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 5.00
    const tax = Math.round((subtotal + deliveryFee) * 0.05 * 100) / 100
    const total = subtotal + deliveryFee + tax

    const fullAddress = `${data.deliveryAddress}, ${data.deliveryCity}`
    const notes = [
      data.customerPhoneNumber ? `Phone: ${data.customerPhoneNumber}` : '',
      data.specialInstructions ? `Notes: ${data.specialInstructions}` : ''
    ].filter(Boolean).join(' | ')

    // We can use a transaction, but simple successive inserts are fine too
    await db.transaction(async (tx) => {
      // Insert order
      await tx.insert(oyruOrders).values({
        id: orderId,
        userId: userId,
        orderNumber: orderNumber,
        totalAmount: total.toString(),
        deliveryAddress: fullAddress,
        deliveryNotes: notes,
        status: 'pending',
      })

      // Insert order items
      for (const item of data.items) {
        await tx.insert(oyruOrderItems).values({
          id: uuidv4(),
          orderId: orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price.toString(),
        })

        // We don't necessarily need to reduce inventory dynamically right here if it's not strictly required,
        // but if we do, we'd fetch the product and update it. Let's do a basic update.
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId)
        })
        if (product && product.stockQuantity >= item.quantity) {
          await tx.update(products)
            .set({ stockQuantity: product.stockQuantity - item.quantity })
            .where(eq(products.id, item.productId))
        }
      }
    })

    return {
      success: true,
      orderId,
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('Error creating product order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get order details from oyruOrders table
 */
export async function getProductOrder(orderId: string) {
  const userId = await getUserId()

  if (!userId) {
    throw new Error('User must be authenticated')
  }

  try {
    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order || order.userId !== userId) {
      return null
    }

    const items = await db.select({
      id: oyruOrderItems.id,
      orderId: oyruOrderItems.orderId,
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
      items,
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
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

  try {
    const orders = await db.query.oyruOrders.findMany({
      where: eq(oyruOrders.userId, userId),
      orderBy: [desc(oyruOrders.createdAt)]
    })

    return orders
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}
