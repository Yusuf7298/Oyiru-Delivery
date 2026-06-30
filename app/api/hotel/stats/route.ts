import { db } from '@/lib/db'
import { oyruOrders } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userOrders = await db
      .select()
      .from(oyruOrders)
      .where(eq(oyruOrders.userId, session.user.id))

    const totalOrders = userOrders.length
    const totalSpent = userOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    )
    
    // In progress orders are submitted but not completed/cancelled
    const pendingOrders = userOrders.filter(
      (o) => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'draft'
    ).length

    return Response.json({
      totalOrders,
      totalSpent,
      pendingOrders,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return Response.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
