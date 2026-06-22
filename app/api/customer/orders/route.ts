import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems } from '@/lib/db/schema'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { hasPermission } from '@/lib/utils/permissions'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const authContext = await getAuthContext()

    if (!requireAuth(authContext) || !hasPermission(authContext, 'view_own_orders')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.userId, authContext.userId))
      .orderBy(oyruOrders.createdAt)

    return Response.json({ success: true, orders })
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
