'use server'

import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems, orderStatusHistory, hotelAccounts, products, deliveries, user, usersProfile } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { updateOrderStatus, getOrderDetails, getHotelOrders as getOrders } from './oyru-orders'
import { getAvailableDrivers } from './delivery-actions'
import { v4 as uuidv4 } from 'uuid'

export const fetchDrivers = getAvailableDrivers;

export async function submitB2BOrder(orderId: string) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    const res = await updateOrderStatus(orderId, 'submitted', 'Order submitted by Hotel')
    if (res.error) return { success: false, error: res.error }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to submit order:', error)
    return { success: false, error: error.message || 'Failed to submit order' }
  }
}

export async function reviewOrderForStock(orderId: string) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Store managers are admins
    if (authContext.role !== 'admin' && authContext.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Store Manager access required.' }
    }

    const res = await updateOrderStatus(orderId, 'inventory_review', 'Inventory reviewed by Store Manager')
    if (res.error) return { success: false, error: res.error }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to review order:', error)
    return { success: false, error: error.message || 'Failed to review order' }
  }
}

export async function approveB2BOrderProducts(orderId: string, approvedItemIds: string[]) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    if (authContext.role !== 'admin' && authContext.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' }
    }

    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order) return { success: false, error: 'Order not found' }

    // Fetch all items for this order
    const items = await db
      .select({
        id: oyruOrderItems.id,
        productId: oyruOrderItems.productId,
        quantity: oyruOrderItems.quantity,
        unitPrice: oyruOrderItems.unitPrice,
        name: products.name,
      })
      .from(oyruOrderItems)
      .innerJoin(products, eq(oyruOrderItems.productId, products.id))
      .where(eq(oyruOrderItems.orderId, orderId))

    const approvedItemsList: typeof items = []
    const rejectedItemsList: typeof items = []

    let newTotal = 0

    await db.transaction(async (tx) => {
      // Update each order item
      for (const item of items) {
        const isApproved = approvedItemIds.includes(item.id)
        const itemStatus = isApproved ? 'approved' : 'rejected'

        await tx
          .update(oyruOrderItems)
          .set({ status: itemStatus, updatedAt: new Date() })
          .where(eq(oyruOrderItems.id, item.id))

        if (isApproved) {
          approvedItemsList.push(item)
          newTotal += parseFloat(item.unitPrice) * item.quantity

          // Decrement stock atomically (since it is approved now)
          const product = await tx.query.products.findFirst({
            where: eq(products.id, item.productId)
          })
          if (product) {
            await tx
              .update(products)
              .set({ stockQuantity: Math.max(0, product.stockQuantity - item.quantity) })
              .where(eq(products.id, item.productId))
          }
        } else {
          rejectedItemsList.push(item)
        }
      }

      // Update order total and status
      await tx
        .update(oyruOrders)
        .set({
          totalAmount: newTotal.toFixed(2),
          status: 'approved',
          updatedAt: new Date()
        })
        .where(eq(oyruOrders.id, orderId))

      // Insert audit trail
      const note = rejectedItemsList.length > 0 
        ? `Partially approved by Store Manager. Approved items: ${approvedItemsList.map(i => i.name).join(', ')}. Rejected: ${rejectedItemsList.map(i => i.name).join(', ')}`
        : `Approved all items by Store Manager: ${approvedItemsList.map(i => i.name).join(', ')}`

      await tx.insert(orderStatusHistory).values({
        id: uuidv4(),
        orderId,
        fromStatus: order.status || null,
        toStatus: 'approved',
        changedBy: authContext.userId,
        reason: note,
        createdAt: new Date(),
      })
    })

    // Send notifications
    const hotel = await db
      .select()
      .from(hotelAccounts)
      .where(eq(hotelAccounts.id, order.hotelAccountId || ''))
      .limit(1)

    const hotelName = hotel[0]?.companyName || 'Valued Hotel'
    const statusMsg = rejectedItemsList.length > 0
      ? `Your order has been partially approved.\n\nApproved:\n${approvedItemsList.map(i => `* ${i.name} (${i.quantity}kg)`).join('\n')}\n\nCurrently unavailable:\n${rejectedItemsList.map(i => `* ${i.name}`).join('\n')}\n\nThese products are temporarily out of stock.`
      : `Your order has been fully approved!\n\nApproved items:\n${approvedItemsList.map(i => `* ${i.name} (${i.quantity}kg)`).join('\n')}`

    // Send Telegram notifications
    const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'approved',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: statusMsg,
    })

    // Notify Super Admin if approved by Store Manager (Admin)
    if (authContext.role === 'admin') {
      await sendOrderStatusNotification({
        orderNumber: order.orderNumber,
        newStatus: 'approved',
        additionalMessage: `Store Manager approved products for Order #${order.orderNumber}. Pending shipment preparation.`,
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error approving order:', error)
    return { success: false, error: error.message || 'Failed to approve order' }
  }
}

export async function approveB2BOrder(orderId: string) {
  try {
    const itemsData = await db
      .select({ id: oyruOrderItems.id })
      .from(oyruOrderItems)
      .where(eq(oyruOrderItems.orderId, orderId))
    const itemIds = itemsData.map(i => i.id)
    return await approveB2BOrderProducts(orderId, itemIds)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getHotelOrders() {
  const res = await getOrders()
  if (res.error) throw new Error(res.error)
  return res.orders || []
}

export async function getHotelOrderDetails(orderId: string) {
  try {
    const authContext = await getAuthContext()
    const res = await getOrderDetails(orderId)
    if (res.error) return { success: false, error: res.error }
    return {
      success: true,
      order: res.order,
      items: res.items || [],
      history: res.history || [],
      role: authContext?.role || '',
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch details' }
  }
}

export const getB2BOrderDetails = getHotelOrderDetails;

export async function prepareAndShipOrder(orderId: string, driverId: string) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    if (authContext.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Only Super Admin can confirm shipment and assign driver.' }
    }

    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order) return { success: false, error: 'Order not found' }

    // 1. Create delivery record
    await db.insert(deliveries).values({
      id: `del_${Date.now()}`,
      orderId,
      driverId,
      status: 'assigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 2. Update order status to assigned
    await db
      .update(oyruOrders)
      .set({ status: 'assigned', updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))

    // 3. Insert audit log
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: order.status || null,
      toStatus: 'assigned',
      changedBy: authContext.userId,
      reason: `Super Admin confirmed shipment and assigned driver.`,
      createdAt: new Date(),
    })

    // Send notifications
    const { sendOrderStatusNotification, sendDriverNotification } = await import('@/lib/services/notification-service')
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: 'assigned',
      hotelAccountId: order.hotelAccountId,
      additionalMessage: 'Super Admin has confirmed your shipment. A driver has been assigned.',
    })

    await sendDriverNotification({
      driverUserId: driverId,
      message: `New delivery assigned: Order #${order.orderNumber} to ${order.deliveryAddress}. Please review in your portal.`,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function prepareShipment(orderId: string) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    if (authContext.role !== 'admin' && authContext.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Store Manager access required.' }
    }

    const order = await db.query.oyruOrders.findFirst({
      where: eq(oyruOrders.id, orderId)
    })

    if (!order) return { success: false, error: 'Order not found' }

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: order.status || null,
      toStatus: order.status || 'approved',
      changedBy: authContext.userId,
      reason: 'Shipment prepared by Store Manager Ahmed',
      createdAt: new Date(),
    })

    const { sendOrderStatusNotification } = await import('@/lib/services/notification-service')
    await sendOrderStatusNotification({
      orderNumber: order.orderNumber,
      newStatus: order.status || 'approved',
      additionalMessage: `Store Manager Ahmed prepared the shipment for Order #${order.orderNumber}. Pending Super Admin confirmation and driver assignment.`,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function shipOrder(orderId: string) {
  try {
    const res = await updateOrderStatus(orderId, 'shipped', 'Order shipped out')
    if (res.error) return { success: false, error: res.error }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function completeOrder(orderId: string) {
  try {
    const res = await updateOrderStatus(orderId, 'completed', 'Order marked completed')
    if (res.error) return { success: false, error: res.error }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
