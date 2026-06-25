import { db } from '@/lib/db'
import { oyruOrders, oyruOrderItems } from '@/lib/db/schema'
import { getAuthContext, requireAuth } from '@/lib/middleware/role-check'
import { canAccessOrderData } from '@/lib/utils/permissions'
import { eq } from 'drizzle-orm'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authContext = await getAuthContext()

    if (!requireAuth(authContext)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.id, (await params).id))
      .limit(1)

    if (!order.length) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check access
    if (!canAccessOrderData(authContext, order[0].userId, order[0].hotelAccountId)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get order items
    const items = await db
      .select()
      .from(oyruOrderItems)
      .where(eq(oyruOrderItems.orderId, (await params).id))

    return Response.json({
      success: true,
      order: {
        ...order[0],
        items,
      },
    })
  } catch (error) {
    console.error('[v0] Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
