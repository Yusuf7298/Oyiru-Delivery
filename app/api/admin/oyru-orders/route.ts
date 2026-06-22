import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    const orders = await db
      .select()
      .from(oyruOrders)
      .orderBy(desc(oyruOrders.createdAt))
      .limit(100)

    return Response.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
