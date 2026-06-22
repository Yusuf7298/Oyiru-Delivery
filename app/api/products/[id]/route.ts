import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    if (product.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json(product[0])
  } catch (error) {
    console.error('[v0] Error fetching product:', error)
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
