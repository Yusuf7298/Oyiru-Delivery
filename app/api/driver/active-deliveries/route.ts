import { db } from '@/lib/db'
import { deliveries, oyruOrders } from '@/lib/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driverId = session.user.id

    // Get all active deliveries for this driver (not delivered)
    const activeDeliveries = await db
      .select({
        id: deliveries.id,
        orderId: deliveries.orderId,
        status: deliveries.status,
        pickupTime: deliveries.pickupTime,
        deliveryTime: deliveries.deliveryTime,
        createdAt: deliveries.createdAt,
        orderNumber: oyruOrders.orderNumber,
        deliveryAddress: oyruOrders.deliveryAddress,
      })
      .from(deliveries)
      .leftJoin(oyruOrders, eq(deliveries.orderId, oyruOrders.id))
      .where(
        and(
          eq(deliveries.driverId, driverId),
          ne(deliveries.status, 'delivered')
        )
      )

    return Response.json(activeDeliveries)
  } catch (error) {
    console.error('Failed to fetch active deliveries:', error)
    return Response.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}
