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

    // Load real product prices/stock from the DB — never trust client-supplied prices.
    const pricedItems = await Promise.all(
      data.items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        })
        if (!product) {
          throw new Error(`Product ${item.productId} is no longer available`)
        }
        if (product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }
        return { productId: item.productId, quantity: item.quantity, unitPrice: parseFloat(product.price) }
      })
    )

    // Calculate totals from trusted DB prices.
    // NOTE: delivery fee and tax are 0 to match the checkout UI ("Free"). Adjust
    // here (and in the checkout summary) if a real fee/tax policy is introduced.
    const subtotal = pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const deliveryFee = 0
    const tax = 0
    const total = subtotal + deliveryFee + tax

    const fullAddress = `${data.deliveryAddress}, ${data.deliveryCity}`
    const notes = [
      data.customerPhoneNumber ? `Phone: ${data.customerPhoneNumber}` : '',
      data.specialInstructions ? `Notes: ${data.specialInstructions}` : ''
    ].filter(Boolean).join(' | ')

    await db.transaction(async (tx) => {
      // Insert order
      await tx.insert(oyruOrders).values({
        id: orderId,
        userId: userId,
        orderNumber: orderNumber,
        totalAmount: total.toString(),
        deliveryAddress: fullAddress,
        deliveryNotes: notes,
        status: 'submitted',
      })

      // Insert order items and decrement stock atomically
      for (const item of pricedItems) {
        await tx.insert(oyruOrderItems).values({
          id: uuidv4(),
          orderId: orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
        })

        // Guarded decrement: re-check stock inside the transaction to avoid
        // overselling under concurrent orders; roll back if it slipped below.
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId)
        })
        if (!product || product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`)
        }
        await tx.update(products)
          .set({ stockQuantity: product.stockQuantity - item.quantity })
          .where(eq(products.id, item.productId))
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
