import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'

export async function GET() {
  try {
    // Get unassigned orders (orders without a driver)
    const availableOrders = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.status, 'pending'))
      .limit(20)

    const deliveries = availableOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    }))

    return Response.json(deliveries)
  } catch (error) {
    console.error('Failed to fetch available deliveries:', error)
    return Response.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}
