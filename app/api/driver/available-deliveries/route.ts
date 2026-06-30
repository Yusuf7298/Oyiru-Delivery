import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getAuthContext, requireDriver } from '@/lib/middleware/role-check'

export async function GET() {
  // Require authenticated driver
  const authContext = await getAuthContext()
  if (!authContext) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireDriver(authContext)) return Response.json({ error: 'Forbidden: driver role required' }, { status: 403 })

  try {
    const availableOrders = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.status, 'approved'))
      .limit(20)

    // Return only fields needed for driver — no private customer data beyond delivery address
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
