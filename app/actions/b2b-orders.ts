'use server'

import { db } from '@/lib/db'
import { oyruOrders, deliveries, user, usersProfile } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { updateOrderStatus, getOrderDetails, getHotelOrders as getOrders } from './oyru-orders'
import { getAvailableDrivers } from './delivery-actions'

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

export async function approveB2BOrder(orderId: string) {
  try {
    const authContext = await getAuthContext()
    if (!requireAuth(authContext)) {
      return { success: false, error: 'Unauthorized' }
    }

    // Both admin and super_admin can approve
    if (authContext.role !== 'admin' && authContext.role !== 'super_admin') {
      return { success: false, error: 'Unauthorized. Admin access required.' }
    }

    const res = await updateOrderStatus(orderId, 'approved', 'Order approved by Super Admin')
    if (res.error) return { success: false, error: res.error }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to approve order:', error)
    return { success: false, error: error.message || 'Failed to approve order' }
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

    const res = await updateOrderStatus(orderId, 'assigned', 'Driver assigned')
    if (res.error) return { success: false, error: res.error }

    await db.insert(deliveries).values({
      id: `del_${Date.now()}`,
      orderId,
      driverId,
      status: 'assigned',
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

    // Prepare shipment translates to assigning driver in our new lifecycle.
    // Since driver assignment requires a driver ID, we'll auto-transition or log it.
    const res = await updateOrderStatus(orderId, 'assigned', 'Shipment prepared')
    if (res.error) return { success: false, error: res.error }

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
