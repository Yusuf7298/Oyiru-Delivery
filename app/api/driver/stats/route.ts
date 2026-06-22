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

    // Get all deliveries for this driver
    const allDeliveries = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.driverId, driverId))

    // Count active deliveries
    const activeCount = allDeliveries.filter(d => d.status !== 'delivered').length
    const totalCount = allDeliveries.length

    // Calculate total earnings
    const completedDeliveries = allDeliveries.filter(d => d.status === 'delivered')
    let totalEarnings = 0

    for (const delivery of completedDeliveries) {
      const order = await db
        .select()
        .from(oyruOrders)
        .where(eq(oyruOrders.id, delivery.orderId))
        .limit(1)

      if (order.length > 0) {
        totalEarnings += Number(order[0].totalAmount)
      }
    }

    return Response.json({
      activeDeliveries: activeCount,
      totalDeliveries: totalCount,
      totalEarnings,
      averageRating: 4.8, // Placeholder
    })
  } catch (error) {
    console.error('Failed to fetch driver stats:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
