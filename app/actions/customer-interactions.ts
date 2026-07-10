'use server'

import { db } from '@/lib/db'
import { oyruOrderFeedbacks, oyruOrderReturns, oyruOrderReturnItems, oyruOrders, oyruOrderItems, usersProfile, user, products, orderStatusHistory, hotelAccounts } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'
import { v4 as uuidv4 } from 'uuid'

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

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'hotel' && profile?.role !== 'restaurant_owner') {
    throw new Error('Forbidden: Only hotels can request returns')
  }

  if (!items || items.length === 0) throw new Error('Must select at least one item to return')

  // Verify order belongs to user and is delivered or completed
  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderId)
  })

  if (!order || order.userId !== userId) throw new Error('Order not found or unauthorized')
  if (order.status !== 'delivered' && order.status !== 'completed') throw new Error('Can only return delivered or completed orders')

  const returnId = `ret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.transaction(async (tx) => {
    await tx.insert(oyruOrderReturns).values({
      id: returnId,
      orderId,
      userId,
      reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Insert individual items
    for (const item of items) {
      if (item.quantity > 0) {
        await tx.insert(oyruOrderReturnItems).values({
          id: `ret_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          returnId,
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          createdAt: new Date(),
        })
      }
    }

    // Log return request in orderStatusHistory
    await tx.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: order.status || null,
      toStatus: order.status || 'completed',
      changedBy: userId,
      reason: `Hotel Hilton requested return for Order #${order.orderNumber}. Reason: ${reason}`,
      createdAt: new Date(),
    })
  })

  // Notify Super Admin
  const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
  await sendOrderStatusNotification({
    orderNumber: order.orderNumber,
    newStatus: 'submitted',
    additionalMessage: `Hotel Hilton requested return for Order #${order.orderNumber}. Reason: ${reason}`,
  })

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

export async function confirmB2BDelivery(orderId: string, rating: number, comment?: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'hotel' && profile?.role !== 'restaurant_owner') {
    throw new Error('Forbidden: Only hotels can confirm delivery')
  }

  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderId)
  })

  if (!order || order.userId !== userId) throw new Error('Order not found')
  if (order.status !== 'delivered') throw new Error('Order must be delivered before confirming')

  await db.transaction(async (tx) => {
    // 1. Update order status to completed
    await tx
      .update(oyruOrders)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))

    // 2. Insert feedback/rating if provided
    if (rating) {
      await tx.insert(oyruOrderFeedbacks).values({
        id: `fdbk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        userId,
        rating,
        comment: comment || null,
      })
    }

    // 3. Log to status history
    await tx.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: 'delivered',
      toStatus: 'completed',
      changedBy: userId,
      reason: 'Delivery confirmed and completed by Hotel',
      createdAt: new Date(),
    })
  })

  // Send notifications
  const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
  await sendOrderStatusNotification({
    orderNumber: order.orderNumber,
    newStatus: 'completed',
    hotelAccountId: order.hotelAccountId,
    additionalMessage: `Hotel ${profile.phoneNumber || ''} confirmed and completed delivery of Order #${order.orderNumber}.`,
  })

  return { success: true }
}

export async function reviewB2BReturnRequest(
  returnId: string, 
  approve: boolean, 
  data?: { driverId?: string, reason?: string }
) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'super_admin') {
    throw new Error('Forbidden: Only Super Admin can approve/reject B2B returns')
  }

  const orderReturn = await db.query.oyruOrderReturns.findFirst({
    where: eq(oyruOrderReturns.id, returnId)
  })

  if (!orderReturn) throw new Error('Return request not found')

  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderReturn.orderId)
  })

  if (!order) throw new Error('Associated order not found')

  const newStatus = approve ? 'approved' : 'rejected'

  await db.transaction(async (tx) => {
    await tx
      .update(oyruOrderReturns)
      .set({
        status: newStatus,
        driverId: approve ? (data?.driverId || null) : null,
        rejectionReason: !approve ? (data?.reason || null) : null,
        updatedAt: new Date(),
      })
      .where(eq(oyruOrderReturns.id, returnId))

    // Log in orderStatusHistory
    await tx.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: order.id,
      fromStatus: order.status || null,
      toStatus: order.status || 'approved', // order status remains as is
      changedBy: userId,
      reason: approve
        ? `Super Admin approved return request. Assigned driver: ${data?.driverId}`
        : `Super Admin rejected return request. Reason: ${data?.reason}`,
      createdAt: new Date(),
    })
  })

  // Send notifications
  const { sendOrderStatusNotification, sendDriverNotification } = await import('@/lib/services/notification-service')
  
  if (approve) {
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'approved',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: `Your return request for Order #${order.orderNumber} has been APPROVED. A driver has been assigned.`,
    })
    if (data?.driverId) {
      await sendDriverNotification({
        driverUserId: data.driverId,
        message: `New return collection assigned. Please collect items from Hilton Hotel/delivery address.`,
      })
    }
  } else {
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'rejected',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: `Your return request for Order #${order.orderNumber} has been REJECTED. Reason: ${data?.reason}`,
    })
  }

  return { success: true }
}

export async function collectB2BReturnedProducts(returnId: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'delivery' && profile?.role !== 'delivery_partner') {
    throw new Error('Forbidden: Only delivery drivers can collect returns')
  }

  const orderReturn = await db.query.oyruOrderReturns.findFirst({
    where: eq(oyruOrderReturns.id, returnId)
  })

  if (!orderReturn) throw new Error('Return request not found')
  if (orderReturn.driverId !== userId) throw new Error('Forbidden: You are not the driver assigned to this return')
  if (orderReturn.status !== 'approved') throw new Error('Return request must be approved first')

  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderReturn.orderId)
  })

  if (!order) throw new Error('Associated order not found')

  const hotel = await db.query.hotelAccounts.findFirst({
    where: eq(hotelAccounts.id, order.hotelAccountId || '')
  })
  const hotelName = hotel?.companyName || 'Hilton Hotel'

  await db.transaction(async (tx) => {
    await tx
      .update(oyruOrderReturns)
      .set({
        status: 'collected',
        updatedAt: new Date(),
      })
      .where(eq(oyruOrderReturns.id, returnId))

    await tx.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: order.id,
      fromStatus: order.status || null,
      toStatus: order.status || 'approved',
      changedBy: userId,
      reason: `Driver ${profile.phoneNumber || ''} collected returned products from ${hotelName}.`,
      createdAt: new Date(),
    })
  })

  // Send notifications
  const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
  await sendOrderStatusNotification({
    orderNumber: order.orderNumber,
    newStatus: 'shipped', // map to shipped/collected notification
    additionalMessage: `Driver ${profile.phoneNumber || ''} collected returned products from ${hotelName} for Order #${order.orderNumber}.`,
  })

  return { success: true }
}

export async function inspectB2BReturnedProducts(returnId: string, accept: boolean, rejectReason?: string) {
  const userId = await getUserId()
  if (!userId) throw new Error('Unauthorized')

  const profile = await db.query.usersProfile.findFirst({
    where: eq(usersProfile.userId, userId)
  })

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    throw new Error('Forbidden: Only Store Manager (Admin) or Super Admin can inspect returned products')
  }

  const orderReturn = await db.query.oyruOrderReturns.findFirst({
    where: eq(oyruOrderReturns.id, returnId)
  })

  if (!orderReturn) throw new Error('Return request not found')
  if (orderReturn.status !== 'collected') throw new Error('Return items must be collected by driver before inspection')

  const order = await db.query.oyruOrders.findFirst({
    where: eq(oyruOrders.id, orderReturn.orderId)
  })

  if (!order) throw new Error('Associated order not found')

  const managerName = profile.phoneNumber || 'Ahmed'

  await db.transaction(async (tx) => {
    const newStatus = accept ? 'completed' : 'rejected'

    await tx
      .update(oyruOrderReturns)
      .set({
        status: newStatus,
        rejectionReason: !accept ? (rejectReason || null) : null,
        updatedAt: new Date(),
      })
      .where(eq(oyruOrderReturns.id, returnId))

    if (accept) {
      // 1. Fetch return items
      const returnItems = await tx.select({
        productId: oyruOrderItems.productId,
        quantity: oyruOrderReturnItems.quantity,
      })
        .from(oyruOrderReturnItems)
        .innerJoin(oyruOrderItems, eq(oyruOrderReturnItems.orderItemId, oyruOrderItems.id))
        .where(eq(oyruOrderReturnItems.returnId, returnId))

      // 2. Increment stock quantities
      for (const item of returnItems) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId)
        })
        if (product) {
          await tx
            .update(products)
            .set({ stockQuantity: product.stockQuantity + item.quantity })
            .where(eq(products.id, item.productId))
        }
      }
    }

    await tx.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId: order.id,
      fromStatus: order.status || null,
      toStatus: order.status || 'approved',
      changedBy: userId,
      reason: accept
        ? `Store Manager ${managerName} accepted returned products. Inventory updated.`
        : `Store Manager ${managerName} rejected returned products. Reason: ${rejectReason}`,
      createdAt: new Date(),
    })
  })

  // Send notifications
  const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
  
  if (accept) {
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'completed',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: `Store Manager ${managerName} accepted returned products for Order #${order.orderNumber}. Return workflow completed successfully.`,
    })
  } else {
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'rejected',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: `Store Manager ${managerName} rejected returned products for Order #${order.orderNumber}. Reason: ${rejectReason}`,
    })
  }

  return { success: true }
}
