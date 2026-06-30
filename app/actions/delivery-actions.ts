'use server'

import { db } from '@/lib/db'
import { deliveries, oyruOrders, orderStatusHistory, hotelAccounts, user, usersProfile } from '@/lib/db/schema'
import { eq, and, desc, or } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { sendOrderStatusNotification } from '@/lib/services/notification-service'

export async function getMyDeliveries() {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) return { error: 'Unauthorized' }

  if (auth.role !== 'delivery' && auth.role !== 'delivery_partner') {
    return { error: 'Only delivery drivers can access this' }
  }

  try {
    const myDeliveries = await db
      .select({
        deliveryId: deliveries.id,
        orderId: deliveries.orderId,
        deliveryStatus: deliveries.status,
        pickupTime: deliveries.pickupTime,
        deliveryTime: deliveries.deliveryTime,
        orderNumber: oyruOrders.orderNumber,
        orderStatus: oyruOrders.status,
        totalAmount: oyruOrders.totalAmount,
        deliveryAddress: oyruOrders.deliveryAddress,
        deliveryNotes: oyruOrders.deliveryNotes,
        hotelAccountId: oyruOrders.hotelAccountId,
        createdAt: deliveries.createdAt,
      })
      .from(deliveries)
      .innerJoin(oyruOrders, eq(deliveries.orderId, oyruOrders.id))
      .where(eq(deliveries.driverId, auth.userId))
      .orderBy(desc(deliveries.createdAt))

    return { success: true, deliveries: myDeliveries }
  } catch (error) {
    console.error('[v0] Error fetching deliveries:', error)
    return { error: 'Failed to fetch deliveries' }
  }
}

export async function updateDeliveryStatus(deliveryId: string, newStatus: 'picked_up' | 'in_transit' | 'delivered') {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) return { error: 'Unauthorized' }

  if (auth.role !== 'delivery' && auth.role !== 'delivery_partner') {
    return { error: 'Only delivery drivers can update delivery status' }
  }

  try {
    const delivery = await db
      .select()
      .from(deliveries)
      .where(and(eq(deliveries.id, deliveryId), eq(deliveries.driverId, auth.userId)))
      .limit(1)

    if (!delivery.length) return { error: 'Delivery not found' }

    // Update delivery status
    const updateData: any = { status: newStatus, updatedAt: new Date() }
    if (newStatus === 'picked_up') updateData.pickupTime = new Date()
    if (newStatus === 'delivered') updateData.deliveryTime = new Date()

    await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, deliveryId))

    // Map delivery status to order status
    const orderStatusMap: Record<string, string> = {
      picked_up: 'shipped',
      in_transit: 'shipped',
      delivered: 'delivered',
    }

    const orderStatus = orderStatusMap[newStatus]
    if (orderStatus) {
      const order = await db
        .select()
        .from(oyruOrders)
        .where(eq(oyruOrders.id, delivery[0].orderId))
        .limit(1)

      if (order.length) {
        await db
          .update(oyruOrders)
          .set({ status: orderStatus as any, updatedAt: new Date() })
          .where(eq(oyruOrders.id, delivery[0].orderId))

        await db.insert(orderStatusHistory).values({
          id: uuidv4(),
          orderId: delivery[0].orderId,
          fromStatus: order[0].status,
          toStatus: orderStatus,
          changedBy: auth.userId,
          reason: `Delivery status: ${newStatus}`,
          createdAt: new Date(),
        })

        await sendOrderStatusNotification({
          orderNumber: order[0].orderNumber,
          newStatus: orderStatus,
          hotelAccountId: order[0].hotelAccountId,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating delivery status:', error)
    return { error: 'Failed to update delivery status' }
  }
}

export async function getAllDeliveries() {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
    return { error: 'Unauthorized' }
  }

  try {
    const allDeliveries = await db
      .select({
        deliveryId: deliveries.id,
        orderId: deliveries.orderId,
        driverId: deliveries.driverId,
        deliveryStatus: deliveries.status,
        pickupTime: deliveries.pickupTime,
        deliveryTime: deliveries.deliveryTime,
        orderNumber: oyruOrders.orderNumber,
        totalAmount: oyruOrders.totalAmount,
        deliveryAddress: oyruOrders.deliveryAddress,
        createdAt: deliveries.createdAt,
      })
      .from(deliveries)
      .innerJoin(oyruOrders, eq(deliveries.orderId, oyruOrders.id))
      .orderBy(desc(deliveries.createdAt))

    return { success: true, deliveries: allDeliveries }
  } catch (error) {
    console.error('[v0] Error fetching all deliveries:', error)
    return { error: 'Failed to fetch deliveries' }
  }
}

export async function getAvailableDrivers() {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
    return { error: 'Unauthorized' }
  }

  try {
    const drivers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: usersProfile.role,
        phone: usersProfile.phoneNumber,
      })
      .from(usersProfile)
      .innerJoin(user, eq(usersProfile.userId, user.id))
      .where(
        or(
          eq(usersProfile.role, 'delivery'),
          eq(usersProfile.role, 'delivery_partner')
        )
      )

    return { success: true, drivers }
  } catch (error) {
    console.error('[v0] Error getting available drivers:', error)
    return { error: 'Failed to fetch drivers' }
  }
}
