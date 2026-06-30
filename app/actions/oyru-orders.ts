'use server'

import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems, hotelAccounts, hotelProductAgreements, products, orderStatusHistory, deliveries } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { isValidOyruTransition, canRolePerformTransition } from '@/lib/services/oyru-order-lifecycle'
import { calculateOrderTotal } from '@/lib/services/pricing-service'
import { sendOrderStatusNotification, notifyNewOrder } from '@/lib/services/notification-service'

export async function placeOrder(data: {
  items: { productId: string; quantity: number }[]
  deliveryAddress: string
  deliveryNotes?: string
  paymentMethod?: 'COD' | 'INVOICE'
}) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'hotel') {
    return { error: 'Only hotel users can place orders' }
  }

  try {
    // Find the hotel account for this user
    const hotel = await db
      .select()
      .from(hotelAccounts)
      .where(eq(hotelAccounts.userId, auth.userId))
      .limit(1)

    if (!hotel.length) {
      return { error: 'Hotel account not found' }
    }

    const hotelAccount = hotel[0]

    if (!hotelAccount.isActive) {
      return { error: 'Your hotel account is inactive. Contact admin.' }
    }

    // Calculate order total using agreed pricing
    const { items: calculatedItems, grandTotal } = await calculateOrderTotal(
      hotelAccount.id,
      data.items
    )

    const orderId = uuidv4()
    const orderNumber = `OYR-${Date.now().toString(36).toUpperCase()}`

    // Create order
    await db.insert(oyruOrders).values({
      id: orderId,
      userId: auth.userId,
      hotelAccountId: hotelAccount.id,
      orderNumber,
      totalAmount: grandTotal.toFixed(2),
      paymentMethod: data.paymentMethod || 'INVOICE',
      deliveryAddress: data.deliveryAddress,
      deliveryNotes: data.deliveryNotes || null,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create order items
    const orderItemsData = calculatedItems.map((item) => ({
      id: uuidv4(),
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await db.insert(oyruOrderItems).values(orderItemsData)

    // Record status history
    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: null,
      toStatus: 'draft',
      changedBy: auth.userId,
      reason: 'Order created',
      createdAt: new Date(),
    })

    return { success: true, orderId, orderNumber, totalAmount: grandTotal }
  } catch (error) {
    console.error('[v0] Error placing order:', error)
    return { error: 'Failed to place order' }
  }
}

export async function submitOrder(orderId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'hotel') {
    return { error: 'Only hotel users can submit orders' }
  }

  try {
    const order = await db
      .select()
      .from(oyruOrders)
      .where(and(eq(oyruOrders.id, orderId), eq(oyruOrders.userId, auth.userId)))
      .limit(1)

    if (!order.length) return { error: 'Order not found' }
    if (order[0].status !== 'draft') return { error: 'Only draft orders can be submitted' }

    await db
      .update(oyruOrders)
      .set({ status: 'submitted', updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: 'draft',
      toStatus: 'submitted',
      changedBy: auth.userId,
      reason: 'Order submitted by hotel',
      createdAt: new Date(),
    })

    // Get hotel name for notification
    const hotel = await db
      .select({ companyName: hotelAccounts.companyName })
      .from(hotelAccounts)
      .where(eq(hotelAccounts.id, order[0].hotelAccountId || ''))
      .limit(1)

    await notifyNewOrder(
      order[0].orderNumber,
      hotel[0]?.companyName || 'Unknown Hotel',
      parseFloat(order[0].totalAmount)
    )

    return { success: true }
  } catch (error) {
    console.error('[v0] Error submitting order:', error)
    return { error: 'Failed to submit order' }
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string, reason?: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) return { error: 'Unauthorized' }

  try {
    const order = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.id, orderId))
      .limit(1)

    if (!order.length) return { error: 'Order not found' }

    const currentStatus = order[0].status as any

    // Validate transition
    if (!isValidOyruTransition(currentStatus, newStatus as any)) {
      return { error: `Cannot transition from ${currentStatus} to ${newStatus}` }
    }

    // Check role permission for this transition
    if (!canRolePerformTransition(auth.role, currentStatus, newStatus as any)) {
      return { error: 'You do not have permission for this status change' }
    }

    await db
      .update(oyruOrders)
      .set({ status: newStatus as any, updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: currentStatus,
      toStatus: newStatus,
      changedBy: auth.userId,
      reason: reason || `Status changed to ${newStatus}`,
      createdAt: new Date(),
    })

    // Send Telegram notification
    await sendOrderStatusNotification({
      orderNumber: order[0].orderNumber,
      newStatus,
      hotelAccountId: order[0].hotelAccountId,
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating order status:', error)
    return { error: 'Failed to update order status' }
  }
}

export async function getHotelOrders() {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) return { error: 'Unauthorized' }

  try {
    let ordersQuery;

    if (auth.role === 'hotel') {
      ordersQuery = await db
        .select()
        .from(oyruOrders)
        .where(eq(oyruOrders.userId, auth.userId))
        .orderBy(desc(oyruOrders.createdAt))
    } else if (auth.role === 'admin' || auth.role === 'super_admin') {
      ordersQuery = await db
        .select()
        .from(oyruOrders)
        .orderBy(desc(oyruOrders.createdAt))
    } else {
      return { error: 'Unauthorized' }
    }

    return { success: true, orders: ordersQuery }
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return { error: 'Failed to fetch orders' }
  }
}

export async function getOrderDetails(orderId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) return { error: 'Unauthorized' }

  try {
    const order = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.id, orderId))
      .limit(1)

    if (!order.length) return { error: 'Order not found' }

    // RBAC check
    if (auth.role === 'hotel' && order[0].userId !== auth.userId) {
      return { error: 'Unauthorized' }
    }

    const items = await db
      .select({
        id: oyruOrderItems.id,
        productId: oyruOrderItems.productId,
        quantity: oyruOrderItems.quantity,
        unitPrice: oyruOrderItems.unitPrice,
        productName: products.name,
        productImage: products.image,
      })
      .from(oyruOrderItems)
      .innerJoin(products, eq(oyruOrderItems.productId, products.id))
      .where(eq(oyruOrderItems.orderId, orderId))

    const history = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.createdAt))

    // Get hotel info
    let hotelInfo = null
    if (order[0].hotelAccountId) {
      const hotel = await db
        .select()
        .from(hotelAccounts)
        .where(eq(hotelAccounts.id, order[0].hotelAccountId))
        .limit(1)
      hotelInfo = hotel[0] || null
    }

    return {
      success: true,
      order: order[0],
      items,
      history,
      hotel: hotelInfo,
    }
  } catch (error) {
    console.error('[v0] Error fetching order details:', error)
    return { error: 'Failed to fetch order details' }
  }
}

export async function assignDriver(orderId: string, driverUserId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can assign drivers' }
  }

  try {
    const order = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.id, orderId))
      .limit(1)

    if (!order.length) return { error: 'Order not found' }
    if (order[0].status !== 'approved') return { error: 'Order must be approved before assigning a driver' }

    // Create delivery record
    await db.insert(deliveries).values({
      id: uuidv4(),
      orderId,
      driverId: driverUserId,
      status: 'assigned',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update order status to assigned
    await db
      .update(oyruOrders)
      .set({ status: 'assigned', updatedAt: new Date() })
      .where(eq(oyruOrders.id, orderId))

    await db.insert(orderStatusHistory).values({
      id: uuidv4(),
      orderId,
      fromStatus: 'approved',
      toStatus: 'assigned',
      changedBy: auth.userId,
      reason: `Driver assigned: ${driverUserId}`,
      createdAt: new Date(),
    })

    await sendOrderStatusNotification({
      orderNumber: order[0].orderNumber,
      newStatus: 'assigned',
      hotelAccountId: order[0].hotelAccountId,
      additionalMessage: 'A driver has been assigned to your order.',
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Error assigning driver:', error)
    return { error: 'Failed to assign driver' }
  }
}
