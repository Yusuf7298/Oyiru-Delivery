import { db } from '@/lib/db'
import { products, categories_oyru } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'
export async function GET() {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const inventory = await db
      .select({
        id: products.id,
        name: products.name,
        categoryName: categories_oyru.name,
        stockQuantity: products.stockQuantity,
        price: products.price,
        isAvailable: products.isAvailable,
      })
      .from(products)
      .leftJoin(categories_oyru, eq(products.categoryId, categories_oyru.id))
      .orderBy(products.stockQuantity)

    return Response.json(inventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
