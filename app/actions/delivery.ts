'use server'

import { db } from '@/lib/db'
import { deliveryPartners, orders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getUserId } from '@/lib/auth-utils'

/**
 * Register as delivery partner
 */
export async function registerDeliveryPartner(data: {
  phoneNumber: string
  vehicleType?: string
  licenseNumber?: string
}) {
  const userId = await getUserId()

  // Check if already registered
  const existing = await db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1)

  if (existing.length) throw new Error('Already registered as delivery partner')

  const partnerId = `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const [partner] = await db
    .insert(deliveryPartners)
    .values({
      id: partnerId,
      userId,
      phoneNumber: data.phoneNumber,
      vehicleType: data.vehicleType,
      licenseNumber: data.licenseNumber,
    })
    .returning()

  return partner
}

/**
 * Get delivery partner profile
 */
export async function getDeliveryPartner() {
  const userId = await getUserId()

  return db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1)
    .then(rows => rows[0] || null)
}

/**
 * Update delivery partner location
 */
export async function updateDeliveryPartnerLocation(latitude: number, longitude: number) {
  const userId = await getUserId()

  const updated = await db
    .update(deliveryPartners)
    .set({
      latitude: String(latitude),
      longitude: String(longitude),
    })
    .where(eq(deliveryPartners.userId, userId))
    .returning()

  return updated[0] || null
}

/**
 * Get available delivery orders
 */
export async function getAvailableOrders() {
  return db
    .select()
    .from(orders)
    .where(and(
      eq(orders.status, 'ready' as any),
      eq(orders.deliveryPartnerId, null)
    ))
}

/**
 * Accept an order for delivery
 */
export async function acceptDeliveryOrder(orderId: string) {
  const userId = await getUserId()

  // Verify delivery partner exists
  const partner = await db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1)

  if (!partner.length) throw new Error('Not registered as delivery partner')

  // Claim order
  const updated = await db
    .update(orders)
    .set({
      deliveryPartnerId: partner[0].id,
      status: 'in_transit' as any,
    })
    .where(and(eq(orders.id, orderId), eq(orders.deliveryPartnerId, null)))
    .returning()

  if (!updated.length) throw new Error('Order not available')

  return updated[0]
}

/**
 * Mark delivery as complete
 */
export async function completeDelivery(orderId: string) {
  const userId = await getUserId()

  // Verify the delivery partner owns this delivery
  const partner = await db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1)

  if (!partner.length) throw new Error('Not registered as delivery partner')

  const updated = await db
    .update(orders)
    .set({
      status: 'delivered' as any,
      actualDeliveryTime: new Date(),
    })
    .where(and(eq(orders.id, orderId), eq(orders.deliveryPartnerId, partner[0].id)))
    .returning()

  if (!updated.length) throw new Error('Order not found')

  // Update partner stats
  await db
    .update(deliveryPartners)
    .set({
      totalOrders: (partner[0].totalOrders || 0) + 1,
    })
    .where(eq(deliveryPartners.id, partner[0].id))

  return updated[0]
}

/**
 * Get delivery partner's active orders
 */
export async function getDeliveryPartnerOrders() {
  const userId = await getUserId()

  const partner = await db
    .select()
    .from(deliveryPartners)
    .where(eq(deliveryPartners.userId, userId))
    .limit(1)

  if (!partner.length) throw new Error('Not registered as delivery partner')

  return db
    .select()
    .from(orders)
    .where(and(
      eq(orders.deliveryPartnerId, partner[0].id),
      and(
        eq(orders.status, 'in_transit' as any),
        eq(orders.status, 'picked_up' as any)
      )
    ))
}
