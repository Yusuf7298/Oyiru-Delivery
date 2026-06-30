import { db } from '@/lib/db'
import { deliveries, oyruOrders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const driverId = session.user.id
    const orderId = (await params).id

    // Create delivery record
    const newDelivery = await db
      .insert(deliveries)
      .values({
        id: `del_${Date.now()}`,
        orderId,
        driverId,
        status: 'assigned',
      })
      .returning()

    // Update order status
    await db
      .update(oyruOrders)
      .set({ status: 'assigned' })
      .where(eq(oyruOrders.id, orderId))

    return Response.json(newDelivery[0])
  } catch (error) {
    console.error('Failed to accept delivery:', error)
    return Response.json({ error: 'Failed to accept delivery' }, { status: 500 })
  }
}
