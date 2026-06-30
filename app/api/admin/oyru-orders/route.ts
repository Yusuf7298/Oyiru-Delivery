import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/middleware/role-check'

export async function GET() {
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireAdmin(authContext)) return Response.json({ error: 'Forbidden' }, { status: 403 })

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
