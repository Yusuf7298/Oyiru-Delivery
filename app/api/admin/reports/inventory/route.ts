import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'

export async function GET() {
  try {
    const items = await db.select().from(products)

    return Response.json(
      items.map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        stockQuantity: item.stockQuantity,
        isAvailable: item.isAvailable,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch inventory report:', error)
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
