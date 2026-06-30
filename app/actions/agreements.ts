'use server'

import { db } from '@/lib/db'
import { hotelProductAgreements, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'

export async function addProductToAgreement(data: {
  hotelId: string
  productId: string
  agreedPrice: string
  unit?: string
}) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can manage agreements' }
  }

  try {
    // Check if agreement already exists
    const existing = await db
      .select()
      .from(hotelProductAgreements)
      .where(
        and(
          eq(hotelProductAgreements.hotelId, data.hotelId),
          eq(hotelProductAgreements.productId, data.productId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Update existing
      await db
        .update(hotelProductAgreements)
        .set({
          agreedPrice: data.agreedPrice,
          unit: data.unit || 'kg',
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(hotelProductAgreements.id, existing[0].id))

      return { success: true, updated: true }
    }

    // Create new
    await db.insert(hotelProductAgreements).values({
      id: uuidv4(),
      hotelId: data.hotelId,
      productId: data.productId,
      agreedPrice: data.agreedPrice,
      unit: data.unit || 'kg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return { success: true, created: true }
  } catch (error) {
    console.error('[v0] Error adding product to agreement:', error)
    return { error: 'Failed to add product to agreement' }
  }
}

export async function removeProductFromAgreement(agreementId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can manage agreements' }
  }

  try {
    await db
      .update(hotelProductAgreements)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(hotelProductAgreements.id, agreementId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error removing product from agreement:', error)
    return { error: 'Failed to remove product from agreement' }
  }
}

export async function getHotelAgreements(hotelId: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth)) {
    return { error: 'Unauthorized' }
  }

  try {
    const agreements = await db
      .select({
        id: hotelProductAgreements.id,
        hotelId: hotelProductAgreements.hotelId,
        productId: hotelProductAgreements.productId,
        agreedPrice: hotelProductAgreements.agreedPrice,
        unit: hotelProductAgreements.unit,
        isActive: hotelProductAgreements.isActive,
        productName: products.name,
        productImage: products.image,
        defaultPrice: products.price,
        createdAt: hotelProductAgreements.createdAt,
      })
      .from(hotelProductAgreements)
      .innerJoin(products, eq(hotelProductAgreements.productId, products.id))
      .where(eq(hotelProductAgreements.hotelId, hotelId))

    return { success: true, agreements }
  } catch (error) {
    console.error('[v0] Error fetching agreements:', error)
    return { error: 'Failed to fetch agreements' }
  }
}

export async function updateAgreementPrice(agreementId: string, newPrice: string) {
  const auth = await getAuthContext()
  if (!requireAuth(auth) || auth.role !== 'super_admin') {
    return { error: 'Only Super Admin can update agreement prices' }
  }

  try {
    await db
      .update(hotelProductAgreements)
      .set({ agreedPrice: newPrice, updatedAt: new Date() })
      .where(eq(hotelProductAgreements.id, agreementId))

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating agreement price:', error)
    return { error: 'Failed to update price' }
  }
}
