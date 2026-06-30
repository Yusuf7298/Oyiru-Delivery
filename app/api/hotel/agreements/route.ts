import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { db } from '@/lib/db'
import { hotelAccounts, hotelProductAgreements, products } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()
    if (!requireRestaurantOwner(authContext)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the hotel account for this user
    const hotel = await db
      .select({ id: hotelAccounts.id })
      .from(hotelAccounts)
      .where(eq(hotelAccounts.userId, authContext!.userId))
      .limit(1)

    if (!hotel.length) {
      return Response.json({ error: 'Hotel account not found' }, { status: 404 })
    }

    const hotelId = hotel[0].id

    // Fetch agreed products
    const agreements = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        name: products.name,
        price: hotelProductAgreements.agreedPrice,
        description: products.description,
        stockQuantity: products.stockQuantity,
        isAvailable: products.isAvailable,
        unit: hotelProductAgreements.unit,
      })
      .from(hotelProductAgreements)
      .innerJoin(products, eq(hotelProductAgreements.productId, products.id))
      .where(
        and(
          eq(hotelProductAgreements.hotelId, hotelId),
          eq(hotelProductAgreements.isActive, true)
        )
      )

    return Response.json({ success: true, products: agreements })
  } catch (error) {
    console.error('[v0] Error fetching hotel agreed products:', error)
    return Response.json({ error: 'Failed to fetch agreed products' }, { status: 500 })
  }
}
