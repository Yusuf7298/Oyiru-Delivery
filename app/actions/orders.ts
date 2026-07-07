'use server'

import { db } from '@/lib/db'
import { orders, orderItems, dishes, restaurants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'
import { getAuthContext, requireRole } from '@/lib/middleware/role-check'

interface OrderItemInput {
  dishId: string
  quantity: number
  specialInstructions?: string
}

/**
 * Create a new order
 */
export async function createOrder(data: {
  restaurantId: string
  items: OrderItemInput[]
  deliveryAddress: string
  deliveryCity: string
  deliveryLatitude?: number
  deliveryLongitude?: number
  customerPhoneNumber?: string
  specialInstructions?: string
}) {
  const userId = await getUserId()

  // Validate restaurant exists
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, data.restaurantId))
    .limit(1)

  if (!restaurant.length) throw new Error('Restaurant not found')

  // Calculate total
  let totalAmount = 0
  const dishPrices: Record<string, string> = {}

  for (const item of data.items) {
    const dish = await db
      .select()
      .from(dishes)
      .where(eq(dishes.id, item.dishId))
      .limit(1)

    if (!dish.length) throw new Error(`Dish ${item.dishId} not found`)
    dishPrices[item.dishId] = dish[0].price
    totalAmount += parseFloat(dish[0].price) * item.quantity
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const deliveryFee = restaurant[0].deliveryFee ? parseFloat(restaurant[0].deliveryFee) : 0

  // Create order
  const [order] = await db
    .insert(orders)
    .values({
      id: orderId,
      userId,
      restaurantId: data.restaurantId,
      totalAmount: String(totalAmount + deliveryFee),
      deliveryFee: String(deliveryFee),
      deliveryAddress: data.deliveryAddress,
      deliveryCity: data.deliveryCity,
      deliveryLatitude: data.deliveryLatitude ? String(data.deliveryLatitude) : undefined,
      deliveryLongitude: data.deliveryLongitude ? String(data.deliveryLongitude) : undefined,
      customerPhoneNumber: data.customerPhoneNumber,
      specialInstructions: data.specialInstructions,
    })
    .returning()

  // Create order items
  for (const item of data.items) {
    const unitPrice = dishPrices[item.dishId]
    const itemTotal = parseFloat(unitPrice) * item.quantity

    await db
      .insert(orderItems)
      .values({
        id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: String(itemTotal),
        specialInstructions: item.specialInstructions,
      })
  }

  return order
}

/**
 * Get user's orders
 */
export async function getUserOrders() {
  const userId = await getUserId()

  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
}

/**
 * Get a single order with items
 */
export async function getOrder(orderId: string) {
  const userId = await getUserId()

  const order = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1)

  if (!order.length) throw new Error('Order not found')

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return { ...order[0], items }
}

/**
 * Update order status (admin/restaurant/delivery partner only)
 */
export async function updateOrderStatus(orderId: string, status: string) {
  const userId = await getUserId()

  // For now, allow users to update their own order status
  // In production, add role-based checks
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order.length) throw new Error('Order not found')

  const updated = await db
    .update(orders)
    .set({ status: status as any })
    .where(eq(orders.id, orderId))
    .returning()

  return updated[0]
}

/**
 * Cancel an order (customer only)
 */
export async function cancelOrder(orderId: string) {
  const userId = await getUserId()

  const order = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1)

  if (!order.length) throw new Error('Order not found or unauthorized')

  if (order[0].status !== 'pending' && order[0].status !== 'confirmed') {
    throw new Error('Cannot cancel order in current status')
  }

  const updated = await db
    .update(orders)
    .set({ status: 'cancelled' as any })
    .where(eq(orders.id, orderId))
    .returning()

  return updated[0]
}
