import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function GET() {
  try {
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
