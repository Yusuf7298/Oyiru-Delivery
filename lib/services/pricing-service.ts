import { db } from '@/lib/db'
import { hotelProductAgreements, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Get the agreed price for a product for a specific hotel.
 * Falls back to the product's default price if no agreement exists.
 */
export async function getAgreedPrice(hotelId: string, productId: string): Promise<{ price: number; isAgreed: boolean }> {
  try {
    const agreement = await db
      .select({ agreedPrice: hotelProductAgreements.agreedPrice })
      .from(hotelProductAgreements)
      .where(
        and(
          eq(hotelProductAgreements.hotelId, hotelId),
          eq(hotelProductAgreements.productId, productId),
          eq(hotelProductAgreements.isActive, true)
        )
      )
      .limit(1)

    if (agreement.length > 0) {
      return { price: parseFloat(agreement[0].agreedPrice), isAgreed: true }
    }

    // Fallback to default product price
    const product = await db
      .select({ price: products.price })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!product.length) {
      throw new Error(`Product ${productId} not found`)
    }

    return { price: parseFloat(product[0].price), isAgreed: false }
  } catch (error) {
    console.error('[v0] Error getting agreed price:', error)
    throw error
  }
}

/**
 * Get all agreed products for a hotel with their prices.
 */
export async function getHotelAgreedProducts(hotelId: string) {
  try {
    const agreements = await db
      .select({
        agreementId: hotelProductAgreements.id,
        productId: hotelProductAgreements.productId,
        agreedPrice: hotelProductAgreements.agreedPrice,
        unit: hotelProductAgreements.unit,
        isActive: hotelProductAgreements.isActive,
        productName: products.name,
        productImage: products.image,
        productDescription: products.description,
        defaultPrice: products.price,
        stockQuantity: products.stockQuantity,
        isAvailable: products.isAvailable,
      })
      .from(hotelProductAgreements)
      .innerJoin(products, eq(hotelProductAgreements.productId, products.id))
      .where(
        and(
          eq(hotelProductAgreements.hotelId, hotelId),
          eq(hotelProductAgreements.isActive, true)
        )
      )

    return agreements
  } catch (error) {
    console.error('[v0] Error getting hotel agreed products:', error)
    throw error
  }
}

/**
 * Calculate order total from items with agreed pricing.
 */
export async function calculateOrderTotal(
  hotelId: string,
  items: { productId: string; quantity: number }[]
): Promise<{ items: { productId: string; quantity: number; unitPrice: number; total: number }[]; grandTotal: number }> {
  try {
    const calculatedItems = await Promise.all(
      items.map(async (item) => {
        const { price } = await getAgreedPrice(hotelId, item.productId)
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          total: price * item.quantity,
        }
      })
    )

    const grandTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0)

    return { items: calculatedItems, grandTotal }
  } catch (error) {
    console.error('[v0] Error calculating order total:', error)
    throw error
  }
}
