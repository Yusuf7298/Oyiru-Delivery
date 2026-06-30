import { db } from '@/lib/db'
import { hotelProductAgreements, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

export async function getHotelAgreements(hotelId: string) {
  try {
    const agreements = await db
      .select({
        id: hotelProductAgreements.id,
        productId: hotelProductAgreements.productId,
        agreedPrice: hotelProductAgreements.agreedPrice,
        unit: hotelProductAgreements.unit,
        isActive: hotelProductAgreements.isActive,
        productName: products.name,
      })
      .from(hotelProductAgreements)
      .innerJoin(products, eq(hotelProductAgreements.productId, products.id))
      .where(eq(hotelProductAgreements.hotelId, hotelId))

    return agreements
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch agreements')
  }
}

export async function createOrUpdateAgreement(data: {
  hotelId: string
  productId: string
  agreedPrice: string
  unit?: string
  isActive?: boolean
}) {
  try {
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
      await db
        .update(hotelProductAgreements)
        .set({
          agreedPrice: data.agreedPrice,
          unit: data.unit || 'kg',
          isActive: data.isActive !== undefined ? data.isActive : true,
          updatedAt: new Date()
        })
        .where(eq(hotelProductAgreements.id, existing[0].id))
      return { success: true, message: 'Agreement updated' }
    }

    await db.insert(hotelProductAgreements).values({
      id: uuidv4(),
      hotelId: data.hotelId,
      productId: data.productId,
      agreedPrice: data.agreedPrice,
      unit: data.unit || 'kg',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return { success: true, message: 'Agreement created' }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upsert agreement')
  }
}

export async function deleteAgreement(agreementId: string) {
  try {
    await db.delete(hotelProductAgreements).where(eq(hotelProductAgreements.id, agreementId))
    return { success: true }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete agreement')
  }
}
