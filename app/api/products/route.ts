import { db } from '@/lib/db'
import { products, hotelAccounts, hotelProductAgreements } from '@/lib/db/schema'
import { getAuthContext } from '@/lib/middleware/role-check'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const authContext = await getAuthContext()

    // If logged in as hotel, only return agreed products with agreed prices
    if (authContext && authContext.role === 'hotel') {
      const hotel = await db
        .select()
        .from(hotelAccounts)
        .where(eq(hotelAccounts.userId, authContext.userId))
        .limit(1)

      if (hotel.length > 0) {
        const hotelId = hotel[0].id
        const agreements = await db
          .select({
            id: products.id,
            categoryId: products.categoryId,
            name: products.name,
            description: products.description,
            image: products.image,
            price: hotelProductAgreements.agreedPrice, // Replace price with agreed price
            weight: products.weight,
            unit: hotelProductAgreements.unit, // Replace unit with agreement unit
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

        return Response.json(agreements)
      }
    }

    // Default: return all products
    const allProducts = await db.select().from(products)
    return Response.json(allProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
