import { db } from '@/lib/db'
import { deliveries, oyruOrders } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driverId = session.user.id

    // Get all completed deliveries for this driver
    const completedDeliveries = await db
      .select({
        id: deliveries.id,
        orderId: deliveries.orderId,
        deliveryTime: deliveries.deliveryTime,
        createdAt: deliveries.createdAt,
        orderNumber: oyruOrders.orderNumber,
        deliveryAddress: oyruOrders.deliveryAddress,
        totalAmount: oyruOrders.totalAmount,
      })
      .from(deliveries)
      .leftJoin(oyruOrders, eq(deliveries.orderId, oyruOrders.id))
      .where(
        and(
          eq(deliveries.driverId, driverId),
          eq(deliveries.status, 'delivered')
        )
      )

    // Calculate total earnings
    const totalEarnings = completedDeliveries.reduce((sum, d) => {
      return sum + (Number(d.totalAmount) || 0)
    }, 0)

    return Response.json({
      deliveries: completedDeliveries,
      totalEarnings,
    })
  } catch (error) {
    console.error('Failed to fetch driver earnings:', error)
    return Response.json({ error: 'Failed to fetch earnings' }, { status: 500 })
  }
}
