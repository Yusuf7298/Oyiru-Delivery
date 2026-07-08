import { db } from '@/lib/db'
import { oyruOrders, orderStatusHistory } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { getAuthContext, requireAuth, requireHotel } from '@/lib/middleware/role-check'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authContext = await getAuthContext()

        if (!requireAuth(authContext) || !requireHotel(authContext)) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: orderId } = await params

        // Find the order — must belong to this user and be in 'delivered' status
        const order = await db
            .select()
            .from(oyruOrders)
            .where(eq(oyruOrders.id, orderId))
            .limit(1)

        if (!order.length) {
            return Response.json({ error: 'Order not found' }, { status: 404 })
        }

        const o = order[0]

        if (o.userId !== authContext!.userId) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (o.status !== 'delivered') {
            return Response.json(
                { error: `Cannot confirm: order is currently "${o.status}", expected "delivered"` },
                { status: 400 }
            )
        }

        // Transition → completed
        await db
            .update(oyruOrders)
            .set({ status: 'completed', updatedAt: new Date() })
            .where(eq(oyruOrders.id, orderId))

        await db.insert(orderStatusHistory).values({
            id: uuidv4(),
            orderId,
            fromStatus: 'delivered',
            toStatus: 'completed',
            changedBy: authContext!.userId,
            reason: 'Delivery confirmed by hotel',
            createdAt: new Date(),
        })

        return Response.json({ success: true })
    } catch (error) {
        console.error('[confirm-delivery] error:', error)
        return Response.json({ error: 'Failed to confirm delivery' }, { status: 500 })
    }
}
