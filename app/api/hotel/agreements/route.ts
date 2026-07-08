import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { db } from '@/lib/db'
import { hotelAccounts, hotelProductAgreements, products, categories_oyru } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const authContext = await getAuthContext()
    if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRestaurantOwner(authContext)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Find hotel account for this user
    const hotel = await db
      .select()
      .from(hotelAccounts)
      .where(eq(hotelAccounts.userId, authContext.userId))
      .limit(1)

    const hotelId = hotel[0]?.id || null
    const hotelAddress = hotel[0]?.address || null

    // Get agreed products (with special agreed price)
    let agreedProductIds: Set<string> = new Set()
    let agreedProducts: any[] = []

    if (hotelId) {
      const agreements = await db
        .select({
          productId: hotelProductAgreements.productId,
          agreedPrice: hotelProductAgreements.agreedPrice,
          unit: hotelProductAgreements.unit,
          isActive: hotelProductAgreements.isActive,
          productName: products.name,
          productDescription: products.description,
          productImage: products.image,
          productCategoryId: products.categoryId,
          productStockQuantity: products.stockQuantity,
          productIsAvailable: products.isAvailable,
          productDefaultPrice: products.price,
        })
        .from(hotelProductAgreements)
        .innerJoin(products, eq(hotelProductAgreements.productId, products.id))
        .where(
          and(
            eq(hotelProductAgreements.hotelId, hotelId),
            eq(hotelProductAgreements.isActive, true)
          )
        )

      agreedProducts = agreements.map(a => ({
        id: a.productId,
        name: a.productName,
        description: a.productDescription,
        image: a.productImage,
        categoryId: a.productCategoryId,
        stockQuantity: a.productStockQuantity,
        isAvailable: a.productIsAvailable,
        price: a.agreedPrice,           // agreed price overrides default
        defaultPrice: a.productDefaultPrice,
        unit: a.unit || 'kg',
        isAgreed: true,
      }))

      agreedProductIds = new Set(agreements.map(a => a.productId))
    }

    // Get ALL other available products (not in agreements)
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.isAvailable, true))

    const otherProducts = allProducts
      .filter(p => !agreedProductIds.has(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image,
        categoryId: p.categoryId,
        stockQuantity: p.stockQuantity,
        isAvailable: p.isAvailable,
        price: p.price,       // standard price
        defaultPrice: p.price,
        unit: p.unit || 'kg',
        isAgreed: false,
      }))

    return Response.json({
      success: true,
      hotelAddress,
      hasAddress: !!hotelAddress,
      hasAgreements: agreedProducts.length > 0,
      agreedProducts,
      otherProducts,
      // Combined for backward compat
      products: [...agreedProducts, ...otherProducts],
    })
  } catch (error) {
    console.error('[v0] Error fetching hotel agreements:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
