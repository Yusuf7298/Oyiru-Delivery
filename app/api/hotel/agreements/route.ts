import { getAuthContext, requireRestaurantOwner } from '@/lib/middleware/role-check'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()
    if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (!requireRestaurantOwner(authContext)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return all available products for hotel ordering
    const availableProducts = await db
      .select()
      .from(products)
      .orderBy(products.name)

    return Response.json({ success: true, products: availableProducts })
  } catch (error) {
    console.error('[v0] Error fetching hotel products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
