'use server'

import { db } from '@/lib/db'
import { oyruOrderFeedbacks, oyruOrderReturns, oyruOrderReturnItems, oyruOrders, oyruOrderItems, usersProfile, user, products } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'

// ==========================================
// Customer Actions
// ==========================================

export async function submitOrderFeedback(orderId: string, rating: number, comment: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  // Verify order belongs to user and is delivered
  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderId)
  })

  if (!order || order.userId !== userId) throw new Error('Order not found or unauthorized')
  if (order.status !== 'delivered' && order.status !== 'completed') throw new Error('Can only leave feedback for delivered or completed orders')

  const id = `fdbk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(oyruOrderFeedbacks).values({
    id,
    orderId,
    userId,
    rating,
    comment
  })

  return { success: true }
}

export async function requestOrderReturn(orderId: string, reason: string, items: { orderItemId: string, quantity: number }[]) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  if (!items || items.length === 0) throw new Error('Must select at least one item to return')

  // Verify order belongs to user and is delivered
  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderId)
  })

  if (!order || order.userId !== userId) throw new Error('Order not found or unauthorized')
  if (order.status !== 'delivered' && order.status !== 'completed') throw new Error('Can only return delivered or completed orders')

  const returnId = `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(oyruOrderReturns).values({
    id: returnId,
    orderId,
    userId,
    reason,
    status: 'pending'
  })

  // Insert individual items
  for (const item of items) {
    if (item.quantity > 0) {
      await db.insert(oyruOrderReturnItems).values({
        id: `ret_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        returnId,
        orderItemId: item.orderItemId,
        quantity: item.quantity
      })
    }
  }

  return { success: true }
}

export async function getOrderFeedback(orderId: string) {
  const userId = await getUserId()
  if (!userId) return null

  const feedback = await db.query.oyruOrderFeedbacks.findFirst({
    where: eq(oyruOrderFeedbacks.orderId, orderId)
  })
  return feedback || null
}

export async function getOrderReturn(orderId: string) {
  const userId = await getUserId()
  if (!userId) return null

  const orderReturn = await db.query.oyruOrderReturns.findFirst({
    where: eq(oyruOrderReturns.orderId, orderId)
  })

  if (!orderReturn) return null

  // fetch return items
  const items = await db.select({
    id: oyruOrderReturnItems.id,
    orderItemId: oyruOrderReturnItems.orderItemId,
    quantity: oyruOrderReturnItems.quantity,
    name: products.name
  })
    .from(oyruOrderReturnItems)
    .innerJoin(oyruOrderItems, eq(oyruOrderReturnItems.orderItemId, oyruOrderItems.id))
    .innerJoin(products, eq(oyruOrderItems.productId, products.id))
    .where(eq(oyruOrderReturnItems.returnId, orderReturn.id))

  return {
    ...orderReturn,
    items
  }
}

// ==========================================
// Admin Actions
// ==========================================

async function ensureAdmin() {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    throw new Error('Forbidden')
  }
}

export async function getAllFeedbacksAdmin() {
  await ensureAdmin()

  const feedbacks = await db.select({
    id: oyruOrderFeedbacks.id,
    rating: oyruOrderFeedbacks.rating,
    comment: oyruOrderFeedbacks.comment,
    createdAt: oyruOrderFeedbacks.createdAt,
    orderId: oyruOrders.id,
    orderNumber: oyruOrders.orderNumber,
    customerName: user.name,
    customerEmail: user.email
  })
    .from(oyruOrderFeedbacks)
    .innerJoin(oyruOrders, eq(oyruOrderFeedbacks.orderId, oyruOrders.id))
    .innerJoin(user, eq(oyruOrderFeedbacks.userId, user.id))
    .orderBy(desc(oyruOrderFeedbacks.createdAt))

  return feedbacks
}

export async function getAllReturnsAdmin() {
  await ensureAdmin()

  const returns = await db.select({
    id: oyruOrderReturns.id,
    reason: oyruOrderReturns.reason,
    status: oyruOrderReturns.status,
    adminNotes: oyruOrderReturns.adminNotes,
    createdAt: oyruOrderReturns.createdAt,
    orderId: oyruOrders.id,
    orderNumber: oyruOrders.orderNumber,
    totalAmount: oyruOrders.totalAmount,
    customerName: user.name,
    customerEmail: user.email
  })
    .from(oyruOrderReturns)
    .innerJoin(oyruOrders, eq(oyruOrderReturns.orderId, oyruOrders.id))
    .innerJoin(user, eq(oyruOrderReturns.userId, user.id))
    .orderBy(desc(oyruOrderReturns.createdAt))

  // Fetch items for each return
  const returnsWithItems = await Promise.all(returns.map(async (ret) => {
    const items = await db.select({
      id: oyruOrderReturnItems.id,
      quantity: oyruOrderReturnItems.quantity,
      name: products.name,
      image: products.image,
      unitPrice: oyruOrderItems.unitPrice
    })
      .from(oyruOrderReturnItems)
      .innerJoin(oyruOrderItems, eq(oyruOrderReturnItems.orderItemId, oyruOrderItems.id))
      .innerJoin(products, eq(oyruOrderItems.productId, products.id))
      .where(eq(oyruOrderReturnItems.returnId, ret.id))

    return {
      ...ret,
      items
    }
  }))

  return returnsWithItems
}

export async function updateReturnStatusAdmin(returnId: string, status: string, adminNotes?: string) {
  await ensureAdmin()

  const orderReturn = await db.query.oyruOrderReturns.findFirst({
    where: eq(oyruOrderReturns.id, returnId)
  })

  if (!orderReturn) throw new Error('Return not found')

  if (status === 'completed' && orderReturn.status !== 'completed') {
    // 1. Fetch return items to know what to deduct and restore
    const returnItems = await db.select({
      orderItemId: oyruOrderReturnItems.orderItemId,
      quantity: oyruOrderReturnItems.quantity,
      productId: oyruOrderItems.productId,
      unitPrice: oyruOrderItems.unitPrice
    })
      .from(oyruOrderReturnItems)
      .innerJoin(oyruOrderItems, eq(oyruOrderReturnItems.orderItemId, oyruOrderItems.id))
      .where(eq(oyruOrderReturnItems.returnId, returnId))

    let refundAmount = 0

    // 2. Add back to inventory and calculate refund amount
    for (const item of returnItems) {
      refundAmount += parseFloat(item.unitPrice) * item.quantity

      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId)
      })

      if (product) {
        await db.update(products)
          .set({ stockQuantity: product.stockQuantity + item.quantity })
          .where(eq(products.id, item.productId))
      }
    }

    // 3. Deduct refundAmount from order total
    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderReturn.orderId)
    })

    if (order) {
      const newTotal = Math.max(0, parseFloat(order.totalAmount || '0') - refundAmount)
      await db.update(oyruOrders)
        .set({ totalAmount: newTotal.toString() })
        .where(eq(oyruOrders.id, order.id))
    }
  }

  await db.update(oyruOrderReturns)
    .set({
      status: status as any,
      adminNotes,
      updatedAt: new Date()
    })
    .where(eq(oyruOrderReturns.id, returnId))

  return { success: true }
}
